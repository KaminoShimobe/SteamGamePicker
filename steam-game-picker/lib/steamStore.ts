import { GoogleGenAI, Type } from '@google/genai';

// Configure the client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const recommendBasedOnSteamStoreFunctionDeclaration = {
    name: "recommend_based_on_steam_store",
    description: "Recommend a Steam game based on the steam library",
    parameters: {
      type: Type.OBJECT,
      properties: {
        username: {
          type: Type.STRING,
          description: "The user's Steam vanity username",
        },
        genre: {
          type: Type.STRING,
          description: "Preferred game genre (e.g. action, strategy, indie)",
        },
        store: {
            type: Type.STRING,
            description: "the Steam Store owned by Valve.",
          },
      },
      required: ["username", "genre"],
    },
  };

//   tools: [{
//     //  functionDeclarations: [recommendSteamGameFunctionDeclaration]
// }],

export default recommendBasedOnSteamStoreFunctionDeclaration;