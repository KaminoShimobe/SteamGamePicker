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
    // Call Gemini API to process the prompt
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: body.prompt,
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
      const { username } = functionCall.args as { username: string };
      if (!username) {
        throw new Error("No username provided in function call.");
      }

      // Fetch the user's owned games and Steam game library
      let userGames = await callSteamAPI(username);
      let libraryGames = await fetchAllSteamGames();
      
      // Combine the user's games with the library
      userGames = userGames.concat(libraryGames);
      console.log(`Combined Games: ${JSON.stringify(userGames)}`);

      // Generate response content with games data
      const contents = [
        {
          role: "user",
          parts: [{ text: body.prompt }],
        },
        {
          role: "model",
          parts: [{
            functionCall: {
              name: functionCall.name,
              args: functionCall.args
            }
          }],
        },
        {
          role: "function",
          parts: [{
            functionResponse: {
              name: functionCall.name,
              response: { userGames }
            }
          }],
        }
      ];

      const functionResponse = {
        name: functionCall.name,
        response:  { userGames }
      };

      contents.push({ role: 'model', parts: [{ functionCall: functionCall }] as any });
      contents.push({ role: 'user', parts: [{ functionResponse: functionResponse }] });

      // Get the final response from the model
      const finalResponse = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: contents,
        config: {
          systemInstruction: "You are not to recommend any games that the user has within their steam library.",
          tools: [{
            functionDeclarations: [recommendSteamGameFunctionDeclaration]
          }],
        },
      });

      console.log(finalResponse.text);
      const newText = await finalResponse.text;
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

const CHUNK_SIZE = 10;
const MAX_PAGES = 10;
const testAppIds = [440, 730, 570]; 
async function fetchAllSteamGames() {
  const steamKey = process.env.STEAM_API_KEY;
  console.log("Steam API key:", process.env.STEAM_API_KEY);
  
  try {
    const response = await fetch(`https://api.steampowered.com/ISteamApps/GetAppList/v2/`);
    const data = await response.json();

    if (data.applist && data.applist.apps) {
      const appIds = data.applist.apps.map((app: { appid: any; }) => app.appid);
      const totalApps = appIds.length;
      console.log(`Total apps available: ${totalApps}`);
      
      const allGames = [];
      // Use chunking and fetch details for multiple app IDs in parallel
      for (let i = 0; i < Math.min(MAX_PAGES, Math.ceil(totalApps / CHUNK_SIZE)); i++) {
        const chunk = appIds.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        
        // Handle errors per chunk and avoid rejection
        try {
          const gameDetails = await fetchGameDetails(chunk);  // Fetch details for each chunk
          allGames.push(...gameDetails);
        } catch (error) {
          console.error(`Error fetching details for chunk :`, error);
        }

        if (i < Math.min(MAX_PAGES, Math.ceil(totalApps / CHUNK_SIZE)) - 1) {
          console.log(`Waiting for 1 second before the next request...`);
          await delay(1000);
        }
      }

      console.log(`Fetched details for ${allGames.length} games.`);
      return allGames;

    } else {
      throw new Error("Failed to fetch Steam game list.");
    }
  } catch (error) {
    console.error("Error during Steam game fetch:", error);
    throw error;
  }
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchGameDetails(appIds: any[]) {
  
  try {
    
    const gameDetails = [];

    // Loop through each appId and fetch its details
    for (const appId of appIds) {
      try {
        console.log(`Processing appId ${appId}`);
        
        const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}`);
    
        // Check if the response is OK (status 200)
        if (!response.ok) {
          throw new Error(`Failed to fetch game details. Status: ${response.status}`);
        }

        // Check if the response is JSON, otherwise log the HTML content
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text(); // Read the HTML response as text
          console.error("Received non-JSON response:", text);
          throw new Error("Received non-JSON response from Steam API");
        }
    
    const data = await response.json();
        const appData = data[appId];
        if (!appData) {
          console.error(`No data found for appId ${appId}`);
          continue; // Skip this iteration if no data is found for this appId
        }

        if (appData.success) {
          console.log(`Successfully fetched details for appId ${appId}`);
          gameDetails.push(appData.data);
        } else {
          console.error(`Failed to fetch details for appId ${appId}:`, appData);
        }
      } catch (error) {
        // Handle errors for individual app fetches without breaking the entire process
        console.error(`Error fetching details for appId ${appId}:`, error);
      }
    }

    console.log(`Fetched details for ${gameDetails.length} games.`);
    return gameDetails;
  } catch (error) {
    console.error('Error during fetchGameDetails:', error);
    throw error; // Re-throw the error to propagate it
  }
}