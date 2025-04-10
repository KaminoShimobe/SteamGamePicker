# SteamGamePicker
A Gemini Powered Chatbot that recommends videogames based on your steam library build in node.js, react, and typescript.


__Project Milestones__

✔️ Obtain working LLM Model API
✔️ Connect with Steam Web API to obtain game
✔️ Train LLM to respond to Steam Web API
✔️ Create Frontend to interact with AI and Steam Web API
- Implement Random steam store selection
- Create Game cards for each of the pulled games


## Obtain working LLM Model API

Gemini was the model chosen due to performance and cost efficiency(free) for this project.

Using the library @google/genai, I was able to work with gemini-2.0-flash for basic responses. Creating a POST request you can ensure that the queury sent by the user is received by gemini-2.0-flash.

```bash
    const body: GenerateRequest = await request.json();

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: body.prompt,
    });
```

This allowed for simple responses utilizing gemini, but this was no different than using gemini normally. To create ensure our LLM model recommends steam games, I had to utilize the Steam Web API.

## Connect with Steam Web API to obtain game info

First , Open [https://steamcommunity.com/dev/apikey]https://steamcommunity.com/dev/apikey with your browser to obtain an api key!

With this key, I attempted to test get requests to get the steamId via vanity username, which allows us to be able to use that steamId for other requests(game library, friends, etc)

```bash
    
    const baseUrl = "http://api.steampowered.com/ISteamUser";
    const result = await fetch(`${baseUrl}/ResolveVanityURL/v0001/?key=${steamKey}&vanityurl=${username}`)
```

This provided us with means to grab .json of steam data, which is the format that can be accepted through Gemini's LLM.

## Train LLM to respond to Steam Web API

To train the LLM to respond to the Steam Web API, I had to implement a process called [https://ai.google.dev/gemini-api/docs/function-calling?example=chart]**Function Calling**.
This ensured Gemini-flash-2.0 was listening for certain keywords and phrases to trigger a function and ensure the query was specified towards that result.

Therefore, I created a function based around using the steam vanity username to obtain the steam user's library:

```bash
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
      },
      required: ["username"],
    },
  };

 ```

 With this function, I can reference it to Gemini and then implement logic to incorporate the data for a suitable response!
 This with more API calls allowed me to use the Steam Library to have Steam Game Picker use my library input to recommend me a game I do not own!

 ## Create Frontend to interact with AI and Steam Web API

 Finally, I created a simple front end to represent this chatbot and give it more flavor. This includes typed out responses, a loading circle, and an icon! Check out below: