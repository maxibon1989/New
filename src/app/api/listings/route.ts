import { NextRequest, NextResponse } from 'next/server';
import { offices, type Office } from '@/data/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Get query parameters
  const city = searchParams.get('city');
  const area = searchParams.get('area');
  const sqmMin = searchParams.get('sqmMin') ? parseInt(searchParams.get('sqmMin')!) : undefined;
  const sqmMax = searchParams.get('sqmMax') ? parseInt(searchParams.get('sqmMax')!) : undefined;
  const rentMin = searchParams.get('rentMin') ? parseInt(searchParams.get('rentMin')!) : undefined;
  const rentMax = searchParams.get('rentMax') ? parseInt(searchParams.get('rentMax')!) : undefined;
  const type = searchParams.get('type');
  const culture = searchParams.get('culture');
  const priceLevel = searchParams.get('priceLevel');
  const verified = searchParams.get('verified');
  const sortBy = searchParams.get('sortBy') || 'match';
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  // Filter offices
  let result = offices.filter(office => {
    if (city && office.city !== city) return false;
    if (area && office.area !== area) return false;
    if (sqmMin && office.sqm < sqmMin) return false;
    if (sqmMax && office.sqm > sqmMax) return false;
    if (rentMin && office.estimatedRent < rentMin) return false;
    if (rentMax && office.estimatedRent > rentMax) return false;
    if (type && office.type !== type) return false;
    if (culture && office.culture !== culture) return false;
    if (priceLevel && office.priceLevel !== priceLevel) return false;
    if (verified === 'true' && !office.verified) return false;
    return true;
  });

  // Add match scores
  result = result.map(office => ({
    ...office,
    matchScore: Math.floor(Math.random() * 25) + 75,
  }));

  // Sort
  switch (sortBy) {
    case 'rent_asc':
      result.sort((a, b) => a.estimatedRent - b.estimatedRent);
      break;
    case 'rent_desc':
      result.sort((a, b) => b.estimatedRent - a.estimatedRent);
      break;
    case 'sqm_asc':
      result.sort((a, b) => a.sqm - b.sqm);
      break;
    case 'sqm_desc':
      result.sort((a, b) => b.sqm - a.sqm);
      break;
    case 'match':
    default:
      result.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }

  const total = result.length;

  // Paginate
  const paginated = result.slice(offset, offset + limit);

  return NextResponse.json({
    data: paginated,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  });
}
