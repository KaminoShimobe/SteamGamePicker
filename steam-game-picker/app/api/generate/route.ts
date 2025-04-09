import { NextResponse } from 'next/server';
import googleai from '@/lib/googleai'; // should export a valid SDK instance
import { use } from 'react';
import { Request } from 'openai/_shims/web-types.mjs';

interface GenerateRequest {
  prompt: string;
  username: string;
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
    console.error("Steam API error:", error);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}

export async function GET(request: Request) {

  const steamKey = process.env.STEAM_API_KEY;
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: "Username is required" }, { status: 400 });
  }

  try {
    const baseUrl = "http://api.steampowered.com/ISteamUser";
    const result = await fetch(`${baseUrl}/ResolveVanityURL/v0001/?key=${steamKey}&vanityurl=${username}`)

    if(!result.ok){
      return NextResponse.json({ error: "Steam API request failed" }, {status: 502});
    }

    const data: {
      response: {
        steamid?: string;
        success: number;
        message?: string;
      };
    } = await result.json();
    
    if (data.response.success !== 1 || !data.response.steamid) {
      return NextResponse.json({ error: data.response.message || 'Username not found' }, { status: 404 });
    }
    console.log('Raw Steam API response:', data);
    console.log('Steam Api ID', data.response.steamid);
    return NextResponse.json({steamId:  data.response.steamid});
  } catch (error) {
    console.error("Steam API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}