import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { vendor } = await request.json();

    if (!vendor || !vendor.name || !vendor.description) {
      return NextResponse.json(
        { error: 'Vendor information is required' },
        { status: 400 }
      );
    }

    const prompt = `Based on this company information:
Name: ${vendor.name}
Description: ${vendor.description}
Industry: ${vendor.industry || 'Not specified'}
URL: ${vendor.url}

Identify the top 3 direct competitors or alternative vendors in this space. For each competitor, provide:
- Company name
- Brief description (1-2 sentences)
- Website URL (use your knowledge of real companies)
- Industry category

Return ONLY valid JSON in this exact format:
{
  "competitors": [
    {
      "name": "Company Name",
      "description": "Brief description",
      "url": "https://company-website.com",
      "industry": "Industry type"
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a business intelligence expert who identifies market competitors. Return only valid JSON with real, accurate company information.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error('No response from OpenAI');

    const parsed = JSON.parse(response);

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('Error suggesting competitors:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to suggest competitors' },
      { status: 500 }
    );
  }
}
