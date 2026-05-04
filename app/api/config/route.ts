import { NextResponse } from 'next/server';
import { readAppConfig } from '@lib/dataService';

export async function GET() {
  try {
    const config = await readAppConfig();

    return NextResponse.json(config, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error in GET /api/config:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch configuration',
        message:
          error instanceof Error
            ? error.message
            : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
