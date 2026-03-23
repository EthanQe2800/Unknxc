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

  // Groq Proxy Endpoint
  app.post("/api/groq", async (req, res) => {
    const { messages, model = "llama-3.3-70b-versatile" } = req.body;
    const groqKey = process.env.GROQ_API_KEY;

    if (!groqKey) {
      return res.status(400).json({ error: "GROQ_API_KEY is not set in the environment." });
    }

    console.log(`[Groq Proxy] Calling Groq API with model ${model}`);

    try {
      const response = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
        model: model,
        messages: messages,
        stream: false,
      }, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${groqKey}`,
        },
        timeout: 30000,
      });

      res.json(response.data);
    } catch (error: any) {
      console.error("Groq Proxy Error:", error.response?.data || error.message);
      res.status(500).json({ 
        error: error.response?.data?.error?.message || error.message || "Failed to connect to Groq",
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
