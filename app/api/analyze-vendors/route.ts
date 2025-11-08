import { NextRequest, NextResponse } from 'next/server';
import { analyzeVendors } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const { vendors, researchCategories } = await request.json();

    if (!vendors || !Array.isArray(vendors) || vendors.length === 0) {
      return NextResponse.json(
        { error: 'Vendors array is required' },
        { status: 400 }
      );
    }

    if (!researchCategories || !Array.isArray(researchCategories) || researchCategories.length === 0) {
      return NextResponse.json(
        { error: 'Research categories array is required' },
        { status: 400 }
      );
    }

    const analysis = await analyzeVendors(vendors, researchCategories);

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('Error in analyze-vendors API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze vendors' },
      { status: 500 }
    );
  }
}
