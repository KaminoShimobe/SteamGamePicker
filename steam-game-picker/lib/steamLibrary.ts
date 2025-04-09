import { GoogleGenAI, Type } from '@google/genai';

// Configure the client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const recommendSteamGameFunctionDeclaration = {
    name: "recommend_steam_game",
    description: "Recommend a Steam game from a user's library",
    parameters: {
      type: Type.OBJECT,
      properties: {
        username: {
          type: Type.STRING,
          description: "The user's Steam vanity username",
        },
        // owned: {
        //     type: Type.BOOLEAN,
        //     description: "Whether or not the game is owned in the user's Steam Library or not.",
        //   },
      },
      required: ["username"],
    },
  };

//   tools: [{
//     //  functionDeclarations: [recommendSteamGameFunctionDeclaration]
// }],

export default recommendSteamGameFunctionDeclaration;