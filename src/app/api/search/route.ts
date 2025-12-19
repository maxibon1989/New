import { NextRequest, NextResponse } from 'next/server';
import { offices, areaStats } from '@/data/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.toLowerCase() || '';
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  if (!q || q.length < 2) {
    return NextResponse.json({
      listings: { data: [], count: 0 },
      areas: { data: [], count: 0 },
      query: q,
    });
  }

  // Search offices
  const matchingOffices = offices.filter(office =>
    office.address.toLowerCase().includes(q) ||
    office.area.toLowerCase().includes(q) ||
    office.city.toLowerCase().includes(q) ||
    office.owner.toLowerCase().includes(q)
  );

  // Add match scores
  const officesWithScores = matchingOffices.map(office => ({
    ...office,
    matchScore: Math.floor(Math.random() * 25) + 75,
  }));

  // Search areas
  const matchingAreas = areaStats.filter(area =>
    area.name.toLowerCase().includes(q) ||
    area.city.toLowerCase().includes(q)
  );

  // Paginate offices
  const paginatedOffices = officesWithScores.slice(offset, offset + limit);

  return NextResponse.json({
    listings: {
      data: paginatedOffices,
      count: matchingOffices.length,
    },
    areas: {
      data: matchingAreas.slice(0, 5),
      count: matchingAreas.length,
    },
    query: q,
  });
}
