import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Ollama Proxy Endpoint
  app.post("/api/chat", async (req, res) => {
    const { prompt } = req.body;
    const ollamaUrl = process.env.OLLAMA_API_URL || "http://localhost:11434";
    const ollamaKey = process.env.OLLAMA_API_KEY;
    const ollamaModel = process.env.OLLAMA_MODEL || "llama3.2";

    console.log(`[Ollama Proxy] Calling ${ollamaUrl}/api/generate with model ${ollamaModel}`);

    try {
      const response = await axios.post(`${ollamaUrl}/api/generate`, {
        model: ollamaModel,
        prompt: prompt,
        stream: false,
      }, {
        headers: {
          "Content-Type": "application/json",
          ...(ollamaKey ? { "Authorization": `Bearer ${ollamaKey}` } : {}),
        },
        timeout: 30000, // 30s timeout
      });

      res.json({ response: response.data.response });
    } catch (error: any) {
      console.error("Ollama Proxy Error:", error.response?.data || error.message);
      res.status(500).json({ 
        error: error.response?.data?.error || error.message || "Failed to connect to Ollama",
        details: "If you are using a local Ollama instance, ensure it is running and accessible from the cloud environment (e.g., via Ngrok)."
      });
    }
  });

  // Vite middleware for development
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
