'use client';

import { useState, FormEvent } from 'react';
import GameCard from '../components/gamecard';

export default function Home() {
  const [prompt, setPrompt] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [id, setId] = useState<string>("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    if (res.ok) {
      setResponse(data.result);
    } else {
      console.error(data.error);
    }
  };

  const handleUsername = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const res = await fetch(`/api/generate/?username=${username}`);
    const data = await res.json();
    if (res.ok) {
      setId(data.steamId);
    } else {
      console.error(data.error);
    }
  };

  

  return (
    <div className="min-h-screen bg-blue-300 flex flex-col items-center p-6">
      <div className="w-full max-w-2xl bg-gray-800 shadow-xl rounded-xl p-6 space-y-6">
        <h1 className="text-4xl font-bold text-blue-700">Steam Game Picker</h1>
        <h2 className="text-2xl font-bold text-blue-500 text-center">Suggest steam games based on your steam username!</h2>

        {/* Steam Username Form */}
        {/* <form onSubmit={handleUsername} className="space-y-2">
          <label className="block text-blue-600 font-medium">Steam Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your Steam username..."
            className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Fetch Steam ID
          </button>
        </form> */}

        {/* {id && (
          <div className="bg-blue-100 p-3 rounded">
            <p className="text-sm text-blue-700">✅ Steam ID: {id}</p>
          </div>
        )} */}

        {/* Prompt Form */}
        <form onSubmit={handleSubmit} className="space-y-2">
          <label className="block text-blue-600 font-medium">Ask Steam Game Picker:</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Recommend me a game based on my library..."
            className="w-full h-24 p-2 border border-blue-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Send
          </button>
        </form>

        {/* Chat Response */}
        {response && (
          <div className="bg-gray-100 p-4 rounded-lg border border-blue-200">
            <h2 className="text-blue-600 font-semibold mb-2">Steam Game Picker says:</h2>
            <p className="text-gray-800 whitespace-pre-line">{response}</p>
          </div>
        )}
      </div>
    </div>
  );
}