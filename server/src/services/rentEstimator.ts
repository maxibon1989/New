/**
 * Rent Estimation Service
 *
 * This is the "secret sauce" - our algorithm for estimating market rent
 * when the official rent is not disclosed (which is common on Objektvision etc.)
 */

import { db, schema } from '../db/index.js';
import { eq, and, gte, lte, avg, sql } from 'drizzle-orm';

interface PropertyData {
  address: string;
  area: string;
  city: string;
  sqm: number;
  buildingYear?: number;
  type?: string;
  culture?: string;
  amenities?: string[];
  metroDistance?: number;
}

interface RentEstimate {
  estimatedRent: number;
  rentMin: number;
  rentMax: number;
  rentPerSqm: number;
  confidence: number;  // 0-100
  factors: string[];
}

export class RentEstimator {
  /**
   * Main estimation function
   * Combines multiple data sources to estimate market rent
   */
  async estimate(property: PropertyData): Promise<RentEstimate> {
    const factors: string[] = [];

    // Step 1: Get base rent from area average
    const areaAvg = await this.getAreaAverageRent(property.area, property.city);
    let baseRentPerSqm = areaAvg || 200; // Default fallback
    factors.push(`Base: ${baseRentPerSqm} kr/kvm (area average)`);

    // Step 2: Adjust for property size
    const sizeAdjustment = this.getSizeAdjustment(property.sqm);
    baseRentPerSqm *= sizeAdjustment;
    if (sizeAdjustment !== 1) {
      factors.push(`Size adjustment: ${((sizeAdjustment - 1) * 100).toFixed(1)}%`);
    }

    // Step 3: Adjust for building age
    if (property.buildingYear) {
      const ageAdjustment = this.getAgeAdjustment(property.buildingYear);
      baseRentPerSqm *= ageAdjustment;
      if (ageAdjustment !== 1) {
        factors.push(`Building age: ${((ageAdjustment - 1) * 100).toFixed(1)}%`);
      }
    }

    // Step 4: Adjust for amenities
    if (property.amenities && property.amenities.length > 0) {
      const amenityAdjustment = this.getAmenityAdjustment(property.amenities);
      baseRentPerSqm *= amenityAdjustment;
      if (amenityAdjustment !== 1) {
        factors.push(`Amenities (${property.amenities.length}): +${((amenityAdjustment - 1) * 100).toFixed(1)}%`);
      }
    }

    // Step 5: Adjust for metro distance
    if (property.metroDistance !== undefined) {
      const metroAdjustment = this.getMetroAdjustment(property.metroDistance);
      baseRentPerSqm *= metroAdjustment;
      if (metroAdjustment !== 1) {
        factors.push(`Metro distance (${property.metroDistance} min): ${((metroAdjustment - 1) * 100).toFixed(1)}%`);
      }
    }

    // Step 6: Look for comparable properties
    const comparables = await this.findComparables(property);
    if (comparables.length > 0) {
      const compAvg = comparables.reduce((sum, c) => sum + c.rentPerSqm, 0) / comparables.length;
      // Blend our estimate with comparables (70/30 weight)
      baseRentPerSqm = baseRentPerSqm * 0.7 + compAvg * 0.3;
      factors.push(`Comparable properties (${comparables.length}): blended`);
    }

    // Calculate final values
    const rentPerSqm = Math.round(baseRentPerSqm);
    const estimatedRent = Math.round((rentPerSqm * property.sqm) / 12); // Monthly
    const variance = 0.08; // 8% variance for min/max

    // Confidence based on data quality
    let confidence = 60;
    if (areaAvg) confidence += 15;
    if (comparables.length > 0) confidence += Math.min(comparables.length * 5, 15);
    if (property.buildingYear) confidence += 5;
    if (property.amenities && property.amenities.length > 0) confidence += 5;

    return {
      estimatedRent,
      rentMin: Math.round(estimatedRent * (1 - variance)),
      rentMax: Math.round(estimatedRent * (1 + variance)),
      rentPerSqm,
      confidence: Math.min(confidence, 95),
      factors,
    };
  }

  /**
   * Get average rent per sqm for an area
   */
  private async getAreaAverageRent(area: string, city: string): Promise<number | null> {
    try {
      const result = await db
        .select({ avg: avg(schema.offices.rentPerSqm) })
        .from(schema.offices)
        .where(
          and(
            eq(schema.offices.area, area),
            eq(schema.offices.city, city),
            eq(schema.offices.available, true)
          )
        );

      return result[0]?.avg ? parseFloat(result[0].avg) : null;
    } catch (error) {
      console.error('Error getting area average:', error);
      return null;
    }
  }

  /**
   * Larger spaces tend to have lower per-sqm rent
   */
  private getSizeAdjustment(sqm: number): number {
    if (sqm < 50) return 1.15;      // Small = premium
    if (sqm < 100) return 1.08;
    if (sqm < 200) return 1.00;     // Reference point
    if (sqm < 400) return 0.95;
    if (sqm < 800) return 0.90;
    return 0.85;                     // Very large = discount
  }

  /**
   * Newer buildings command higher rents
   */
  private getAgeAdjustment(buildingYear: number): number {
    const currentYear = new Date().getFullYear();
    const age = currentYear - buildingYear;

    if (age <= 5) return 1.12;      // Brand new
    if (age <= 15) return 1.05;     // Modern
    if (age <= 30) return 1.00;     // Standard
    if (age <= 50) return 0.95;     // Older
    if (age <= 80) return 0.92;     // Historic (can be charm)
    return 0.88;                     // Very old
  }

  /**
   * Premium amenities increase value
   */
  private getAmenityAdjustment(amenities: string[]): number {
    let adjustment = 1.0;

    const premiumAmenities: Record<string, number> = {
      'Gym': 0.03,
      'Reception': 0.02,
      'Dusch': 0.02,
      'Parkering': 0.03,
      'Balkong': 0.02,
      'Terrass': 0.03,
      'Fiber': 0.01,
      'Larm': 0.01,
      'Högt i tak': 0.02,
    };

    for (const amenity of amenities) {
      if (premiumAmenities[amenity]) {
        adjustment += premiumAmenities[amenity];
      }
    }

    return Math.min(adjustment, 1.15); // Cap at 15% premium
  }

  /**
   * Closer to metro = higher rent
   */
  private getMetroAdjustment(minutes: number): number {
    if (minutes <= 2) return 1.08;
    if (minutes <= 5) return 1.04;
    if (minutes <= 10) return 1.00;
    if (minutes <= 15) return 0.96;
    return 0.92;
  }

  /**
   * Find similar properties for comparison
   */
  private async findComparables(property: PropertyData): Promise<Array<{ rentPerSqm: number }>> {
    try {
      const sqmMin = property.sqm * 0.7;
      const sqmMax = property.sqm * 1.3;

      const results = await db
        .select({
          rentPerSqm: sql<number>`CAST(${schema.offices.rentPerSqm} AS FLOAT)`,
        })
        .from(schema.offices)
        .where(
          and(
            eq(schema.offices.city, property.city),
            gte(schema.offices.sqm, Math.round(sqmMin)),
            lte(schema.offices.sqm, Math.round(sqmMax)),
            eq(schema.offices.available, true)
          )
        )
        .limit(10);

      return results.filter((r) => r.rentPerSqm !== null);
    } catch (error) {
      console.error('Error finding comparables:', error);
      return [];
    }
  }
}

export const rentEstimator = new RentEstimator();
