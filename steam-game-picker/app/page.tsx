'use client';

import { useState, FormEvent } from 'react';
import GameCard from '../components/gamecard';
import TypingIndicator from '@/components/typingIndicator';
import { Typewriter } from 'react-simple-typewriter';
import { FaRobot } from 'react-icons/fa';
import Image from "next/image";

export default function Home() {
  const [prompt, setPrompt] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [id, setId] = useState<string>("");
  const [games, setGames] = useState<any[]>([]);
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResponse("")

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });
    
    const data = await res.json();
    if (res.ok) {
      setLoading(false);
      setResponse(data.result);
      // const parsed = JSON.parse(data.result); // Or directly use `data.result.games` if already parsed
      if (data.games) {
        setGames(data.games); // Store the recommended games
      }
    } else {
      console.error(data.error);
      setLoading(false);
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
    <div className="min-h-screenb text-blue-300 g-slate-50 flex flex-col items-center p-6">
      <div className="w-full max-w-2xl bg-gray-800 shadow-xl rounded-xl p-6 space-y-6">
        <h1 className="text-4xl font-bold text-blue-700 text-start">Steam Game Picker</h1>
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
          <label className="block text-blue-200 font-medium">Ask Steam Game Picker:</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Recommend me a game based on my library..."
            className="w-full h-24 p-2 border border-blue-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <div className='text-end'>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            
            Send
          </button>
          </div>
        </form>

        {/* Chat Response */}
        {loading && <TypingIndicator />}
        <img
  src="/SGP_Icon.png"
  alt="SGP bot"
  className="w-10 h-10 rounded-full border border-blue-400"
/>
        {response && !loading && (
          <div className="bg-gray-100 p-4 rounded-lg border border-blue-200">
            <h2 className="text-blue-600 font-semibold mb-2">Steam Game Picker says:</h2>
            <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                  <Typewriter
            words={[response]}
            typeSpeed={30}
            cursor
            cursorStyle="_"
          /></p>
          </div>
        )}

        {/* {games.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {games
              .filter((game) => game && (game.appid || game.name))
              .map((game, index) => (
                <GameCard key={game.appid || game.name || index} game={game} />
              ))}
          </div>
        )} */}
      </div>
    </div>

    
  );
}