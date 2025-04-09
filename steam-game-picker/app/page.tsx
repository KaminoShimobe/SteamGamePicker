'use client';

import { useState, FormEvent } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState<string>("");
  const [response, setResponse] = useState<string>("");

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

  return (
    <div>
      <h1>Gemini Integration with Next.js</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt here..."
        />
        <button type="submit">Generate</button>
      </form>
      {response && <div><h2>Response:</h2><p>{response}</p></div>}
    </div>
  );
}