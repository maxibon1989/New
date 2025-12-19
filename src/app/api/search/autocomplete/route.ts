import { NextRequest, NextResponse } from 'next/server';
import { offices, areaStats } from '@/data/mockData';

interface Suggestion {
  type: 'city' | 'area' | 'address';
  value: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.toLowerCase() || '';

  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const suggestions: Suggestion[] = [];
  const seen = new Set<string>();

  // Get unique cities
  offices.forEach(office => {
    if (office.city.toLowerCase().includes(q) && !seen.has(office.city)) {
      suggestions.push({ type: 'city', value: office.city });
      seen.add(office.city);
    }
  });

  // Get unique areas
  areaStats.forEach(area => {
    const areaKey = `${area.name}, ${area.city}`;
    if (area.name.toLowerCase().includes(q) && !seen.has(areaKey)) {
      suggestions.push({ type: 'area', value: areaKey });
      seen.add(areaKey);
    }
  });

  // Get matching addresses
  offices.forEach(office => {
    if (office.address.toLowerCase().includes(q) && suggestions.length < 10) {
      suggestions.push({ type: 'address', value: office.address });
    }
  });

  // Limit results
  return NextResponse.json({
    suggestions: suggestions.slice(0, 8),
  });
}
