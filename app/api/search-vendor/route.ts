import { NextRequest, NextResponse } from 'next/server';
import { searchVendorInfo } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const vendorInfo = await searchVendorInfo(url);

    return NextResponse.json(vendorInfo);
  } catch (error: any) {
    console.error('Error in search-vendor API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search vendor information' },
      { status: 500 }
    );
  }
}
