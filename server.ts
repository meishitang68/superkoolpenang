import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini client to avoid startup crashes if the key is missing.
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. AI Troubleshooting Endpoint - Penang Style!
app.post("/api/ai/diagnose", async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      res.status(400).json({ error: "Message is required." });
      return;
    }

    const ai = getGeminiClient();

    // Map existing history into Gemini content structure
    const formattedContents: any[] = [];
    if (Array.isArray(history)) {
      history.forEach((h: { sender: string; text: string }) => {
        formattedContents.push({
          role: h.sender === "user" ? "user" : "model",
          parts: [{ text: h.text }],
        });
      });
    }

    // Add current user message
    formattedContents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const systemInstruction = 
      "You are 'Mike AI', a legendary, friendly AI assistant representation of Mike, the senior aircon service technician in Penang, Malaysia with 30 years of hands-on experience. " +
      "You speak in a warm, polite Penang English/Manglish tone (using words like 'lah', 'lo', 'cannot-lah', 'solid', 'swee', 'aiyo' naturally but professionally). " +
      "Explain things simply with transparent honesty. Provide handy advice for Penangites (e.g., humidity and sea breeze in Gurney, Batu Ferringhi, or heat in Bayan Lepas industrial area). " +
      "Provide a clean diagnostic report for their climate control issues (e.g., water leaking, no cold air, weird noises, smelling bad). " +
      "At the end, suggest scheduling a service with 'SuperCool Penang' directly in our app so we can send an experienced local team (like Anwar, Muthu, or yourself) with our high-pressure chemical wash tools to fix it properly. " +
      "Keep responses concise, structural (using bullets or numbered lists where fits), and extremely helpful.";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });

    const reply = response.text || "Aiyo, something went wrong with my line-lah. Ask me again can?";
    res.json({ reply });
  } catch (err: any) {
    console.error("Gemini Error:", err);
    res.status(500).json({
      error: "Mike AI is currently busy servicing on a ladder. Please try again soon!",
      details: err.message,
    });
  }
});

// Start core full-stack routing and Vite serving
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Mike AI's Penang SuperCool server running at http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server", err);
});
