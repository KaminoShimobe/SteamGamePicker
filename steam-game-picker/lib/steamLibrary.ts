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
        // genre: {
        //   type: Type.STRING,
        //   description: "Preferred game genre (e.g. action, strategy, indie)",
        // },
      },
      required: ["username"],
    },
  };

//   tools: [{
//     //  functionDeclarations: [recommendSteamGameFunctionDeclaration]
// }],

export default recommendSteamGameFunctionDeclaration;