import { NextRequest, NextResponse } from 'next/server';
import { offices, areaStats } from '@/data/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');

  let filteredOffices = offices;
  let filteredAreas = areaStats;

  if (city) {
    filteredOffices = offices.filter(o => o.city === city);
    filteredAreas = areaStats.filter(a => a.city === city);
  }

  // Calculate statistics
  const totalListings = filteredOffices.length;
  const avgRent = filteredOffices.reduce((sum, o) => sum + o.estimatedRent, 0) / totalListings;
  const avgSqm = filteredOffices.reduce((sum, o) => sum + o.sqm, 0) / totalListings;
  const avgRentPerSqm = filteredOffices.reduce((sum, o) => sum + o.rentPerSqm, 0) / totalListings;
  const verifiedCount = filteredOffices.filter(o => o.verified).length;

  // Group by type
  const byType = filteredOffices.reduce((acc, o) => {
    acc[o.type] = (acc[o.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Group by price level
  const byPriceLevel = filteredOffices.reduce((acc, o) => {
    acc[o.priceLevel] = (acc[o.priceLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return NextResponse.json({
    summary: {
      totalListings,
      avgRent: Math.round(avgRent),
      avgSqm: Math.round(avgSqm),
      avgRentPerSqm: Math.round(avgRentPerSqm),
      verifiedCount,
      verifiedPercentage: Math.round((verifiedCount / totalListings) * 100),
    },
    byType: Object.entries(byType).map(([type, count]) => ({ type, count })),
    byPriceLevel: Object.entries(byPriceLevel).map(([priceLevel, count]) => ({ priceLevel, count })),
    areasCount: filteredAreas.length,
    generatedAt: new Date().toISOString(),
  });
}
