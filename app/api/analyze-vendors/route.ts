import { NextRequest, NextResponse } from 'next/server';
import { analyzeVendors } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received request body:', JSON.stringify(body, null, 2));

    const { vendors, researchCategories } = body;

    console.log('Vendors:', vendors);
    console.log('Research Categories:', researchCategories);

    if (!vendors || !Array.isArray(vendors) || vendors.length === 0) {
      console.error('Vendors validation failed:', { vendors, isArray: Array.isArray(vendors), length: vendors?.length });
      return NextResponse.json(
        { error: 'Vendors array is required' },
        { status: 400 }
      );
    }

    if (!researchCategories || !Array.isArray(researchCategories) || researchCategories.length === 0) {
      console.error('Categories validation failed:', { researchCategories, isArray: Array.isArray(researchCategories), length: researchCategories?.length });
      return NextResponse.json(
        { error: 'Research categories array is required' },
        { status: 400 }
      );
    }

    console.log('Calling analyzeVendors with:', { vendorCount: vendors.length, categoryCount: researchCategories.length });
    const analysis = await analyzeVendors(vendors, researchCategories);

    console.log('Analysis completed successfully');
    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('Error in analyze-vendors API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze vendors' },
      { status: 500 }
    );
  }
}
