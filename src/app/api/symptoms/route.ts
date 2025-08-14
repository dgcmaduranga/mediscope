import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { age, gender, symptoms } = await req.json();

  // AI Prompt
  const prompt = `
  Patient details:
  Age: ${age}
  Gender: ${gender}
  Symptoms: ${symptoms}

  Based on these symptoms, give:
  - Risk level (low, moderate, high)
  - Possible causes
  - Recommendations
  - Short explanation in medical terms
  `;

  // Call OpenAI
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const aiResponse = completion.choices[0].message.content;

  return new Response(JSON.stringify({
    aiAnalysis: aiResponse,
    predefinedResults: "Existing rule-based results here..."
  }), { status: 200 });
}
