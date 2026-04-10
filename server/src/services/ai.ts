import Anthropic from '@anthropic-ai/sdk';

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export interface AIAnalysisResult {
  sentiment: string;
  sentimentScore: number;
  category: string;
  customerClass: string;
  keyPhrases: string[];
  complaintSummary: string | null;
  emotion: string;
}

export async function analyzeReview(
  reviewText: string,
  starRating: number,
  productName: string
): Promise<AIAnalysisResult> {
  const prompt = `Analyze the following customer review and return a JSON object with these fields:
- sentiment: "positive", "neutral", or "negative"
- sentimentScore: integer 0-100 (0 = most negative, 100 = most positive)
- category: the primary complaint/praise category — one of: "quality", "delivery", "packaging", "price", "service"
- customerClass: "loyal", "neutral", or "problematic"
- keyPhrases: array of 3-5 key phrases extracted from the review (in the original language)
- complaintSummary: a brief 1-sentence summary of the complaint in the same language, or null if positive
- emotion: one word describing the primary emotion — e.g. "joy", "anger", "disappointment", "satisfaction", "neutral"

Product: ${productName}
Star rating: ${starRating}/5
Review: ${reviewText}

Respond ONLY with valid JSON, no markdown, no explanation.`;

  const message = await getClient().messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = message.content[0].type === 'text' ? message.content[0].text : '';
  const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  const parsed = JSON.parse(text);

  return {
    sentiment: parsed.sentiment,
    sentimentScore: parsed.sentimentScore,
    category: parsed.category,
    customerClass: parsed.customerClass,
    keyPhrases: parsed.keyPhrases,
    complaintSummary: parsed.complaintSummary ?? null,
    emotion: parsed.emotion,
  };
}
