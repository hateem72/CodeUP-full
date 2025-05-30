import axios from "axios";

const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  console.error("API Key is not defined. Please check your environment variables.");
}

export const fetchAifyResponse = async (prompt) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

  const messageToSend = [
    {
      parts: [{ text: prompt }],
      role: "user",
    },
  ];

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: messageToSend }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const resjson = await response.json();
    const generatedText = resjson.candidates[0].content.parts[0].text.trim();
    return generatedText;
  } catch (error) {
    console.error("Error fetching data from Gemini API:", error);
    throw error;
  }
};
