import fetch from "node-fetch";

const API_KEY = "AIzaSyDb1uuPPv6DtxJ93UsuelfEeFMDPA2nbsY";

if (!API_KEY) {
  console.error("import.meta.e.");
}

export const generateQuestionsFromGemini = async (prompt) => {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" + API_KEY;

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