import { NextResponse } from 'next/server';
import googleai from '@/lib/googleai'; // should export a valid SDK instance

interface GenerateRequest {
  prompt: string;
}

export async function POST(request: Request) {

  const body: GenerateRequest = await request.json();

  if (!body.prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  try {
    const model = googleai.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: body.prompt }] }],
    });

    const text = await result.response.text();

    return NextResponse.json({ result: text });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}
