import { NextRequest, NextResponse } from 'next/server';
import { areaStats, rentHistory } from '@/data/mockData';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ city: string; name: string }> }
) {
  const { city, name } = await params;

  const decodedCity = decodeURIComponent(city);
  const decodedName = decodeURIComponent(name);

  const area = areaStats.find(
    a => a.city.toLowerCase() === decodedCity.toLowerCase() &&
         a.name.toLowerCase() === decodedName.toLowerCase()
  );

  if (!area) {
    return NextResponse.json(
      { error: 'Area not found' },
      { status: 404 }
    );
  }

  // Get rent history for this area
  const history = rentHistory[area.name] || [];

  return NextResponse.json({
    area,
    rentHistory: history,
  });
}
