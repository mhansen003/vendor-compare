import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function searchVendorInfo(url: string) {
  try {
    const prompt = `Given this website URL: ${url}
    
Extract the following information about this company/vendor:
- Company name
- Brief description (1-2 sentences)
- Industry/category
- Logo URL (if available from common locations)

Return the information in JSON format:
{
  "name": "Company Name",
  "description": "Brief description",
  "industry": "Industry type",
  "logo": "logo URL or null"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that extracts company information from websites. Return only valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error('No response from OpenAI');

    return JSON.parse(response);
  } catch (error) {
    console.error('Error searching vendor:', error);
    throw error;
  }
}

export async function analyzeVendors(
  vendors: Array<{ id: string; name: string; url: string; description: string }>,
  researchCategories: string[]
) {
  try {
    const vendorList = vendors.map(v => `- ${v.name} (${v.url}): ${v.description}`).join('\n');
    const categoriesList = researchCategories.join(', ');

    const prompt = `Compare these vendors based on the following research categories:

Vendors:
${vendorList}

Research Categories: ${categoriesList}

For each research category, provide detailed analysis for each vendor. Then provide an overall summary and recommendations.

Return the response in the following JSON format:
{
  "comparisons": [
    {
      "category": "category name",
      "vendors": {
        "vendor-id": {
          "content": "detailed analysis",
          "summary": "brief summary"
        }
      }
    }
  ],
  "overallSummary": "comprehensive summary comparing all vendors",
  "recommendations": ["recommendation 1", "recommendation 2", ...]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert business analyst who provides detailed vendor comparisons. Return only valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 4000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error('No response from OpenAI');

    return JSON.parse(response);
  } catch (error) {
    console.error('Error analyzing vendors:', error);
    throw error;
  }
}
