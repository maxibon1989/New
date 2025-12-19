import { NextRequest, NextResponse } from 'next/server';
import { offices } from '@/data/mockData';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const office = offices.find(o => o.id === id);

  if (!office) {
    return NextResponse.json(
      { error: 'Office not found' },
      { status: 404 }
    );
  }

  // Find similar offices in same area
  const similar = offices
    .filter(o => o.id !== id && o.area === office.area)
    .slice(0, 4);

  return NextResponse.json({
    data: office,
    similar,
  });
}
