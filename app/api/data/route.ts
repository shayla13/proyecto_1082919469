import { NextResponse } from 'next/server';
import { readHomeData } from '@lib/dataService';

export async function GET() {
  try {
    const data = await readHomeData();

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error in GET /api/data:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch home data',
        message:
          error instanceof Error
            ? error.message
            : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
