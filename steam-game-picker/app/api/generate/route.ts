import { NextResponse } from 'next/server';
import googleai from '@/lib/googleai'; // should export a valid SDK instance
import { use } from 'react';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLEAI_API_KEY });

import recommendSteamGameFunctionDeclaration from '@/lib/steamLibrary'; 

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
    

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: body.prompt ,
      config: {
        tools: [{
          functionDeclarations: [recommendSteamGameFunctionDeclaration]
        }],
      },
    });
    const text = await result.text;
    
    if (result.functionCalls && result.functionCalls.length > 0) {
      const functionCall = result.functionCalls[0]; // Assuming one function call
      console.log(`Function to call: ${functionCall.name}`);
      console.log(`Arguments: ${JSON.stringify(functionCall.args)}`);
      const { username } = functionCall.args as {username: string};
      if (!username) {
        throw new Error("No username provided in function call.");
      }
      const games = await callSteamAPI(username);


      let newResult;
      // if (functionCall.name === 'recommend_steam_game') {
      //   newResult = setLightValues(functionCall.args.brightness, functionCall.args.color_temp);
      //   console.log(`Function execution result: ${JSON.stringify(result)}`);
      // }
      console.log(`Function execution result: ${JSON.stringify(games)}`);
      const contents = [
        {
          role: "user",
          parts: [{ text: body.prompt }]
        },
        {
          role: "model",
          parts: [{
            functionCall: {
              name: functionCall.name,
              args: functionCall.args
            }
          }]
        },
        {
          role: "function",
          parts: [{
            functionResponse: {
              name: functionCall.name,
              response: {games}
            }
          }]
        }
      ];
      

      const function_response_part = {
        name: functionCall.name,
        response: { games}
      }

      contents.push({ role: 'model', parts: [{ functionCall: functionCall }] as any });
      contents.push({ role: 'user', parts: [{ functionResponse: function_response_part }] });

      // Get the final response from the model
      const final_response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: contents,
        config: {
          tools: [{
            functionDeclarations: [recommendSteamGameFunctionDeclaration]
          }],
        },
      });

      console.log(final_response.text);
      const newText = await final_response.text;
      return NextResponse.json({ result: newText });

    } else {
      
      console.log("No function call found in the response.");
      console.log(result.text);
      return NextResponse.json({ result: text });
    }
  
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

async function callSteamAPI(username: string) {
  //Obtain steamKey first
  const steamKey = process.env.STEAM_API_KEY;
  console.log("Steam API key:", process.env.STEAM_API_KEY);
  
  //vanityUrl API request so we can transform our steam username into the Id.
  const vanityResult = await fetch(
    `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${steamKey}&vanityurl=${username}`
  );

  const vanityData = await vanityResult.json();
  const steamId = vanityData.response?.steamid;
  console.log(steamId);
  if (!steamId) {
    throw new Error("Steam ID not found for username.");
  }
   //Using our steamId we can grab our user's list of games
  const gamesResult = await fetch(
    `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${steamKey}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true`
  );
  
  const gamesData = await gamesResult.json();
  console.log(gamesData);
  return gamesData.response.games || [];
}