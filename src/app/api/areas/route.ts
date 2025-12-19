import { NextRequest, NextResponse } from 'next/server';
import { areaStats, rentHistory } from '@/data/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');

  let areas = areaStats;

  if (city) {
    areas = areas.filter(a => a.city === city);
  }

  // Sort by average rent (highest first)
  areas.sort((a, b) => b.avgRentPerSqm - a.avgRentPerSqm);

  return NextResponse.json({
    data: areas,
    total: areas.length,
  });
}
