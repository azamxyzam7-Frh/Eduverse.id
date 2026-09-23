import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY belum diatur. EduAI akan gagal sampai environment variable tersebut tersedia.");
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json({ limit: "32kb" }));
app.use(express.static(__dirname));

app.post("/api/chat", async (req, res) => {
  try {
    const message = String(req.body?.message || "").trim();
    const history = Array.isArray(req.body?.history) ? req.body.history.slice(-12) : [];

    if (!message) return res.status(400).json({ error: "Pertanyaan kosong." });
    if (message.length > 5000) return res.status(400).json({ error: "Pertanyaan terlalu panjang." });

    const safeHistory = history
      .filter(x => x && (x.role === "user" || x.role === "assistant") && typeof x.content === "string")
      .map(x => ({ role: x.role, content: x.content.slice(0, 5000) }));

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      instructions:
        "Kamu adalah EduAI, asisten pendidikan untuk Eduverse.id. " +
        "Jawab pertanyaan pengguna dengan ramah, jelas, dan sesuai usia pelajar. " +
        "Untuk soal matematika/sains, tampilkan langkah pengerjaan yang ringkas namun jelas. " +
        "Jika tidak yakin, katakan bahwa kamu tidak yakin dan jangan mengarang fakta. " +
        "Jangan meminta atau menyimpan password, API key, atau data pribadi sensitif. " +
        "Utamakan bantuan belajar.",
      input: [...safeHistory, { role: "user", content: message }]
    });

    res.json({ answer: response.output_text || "Maaf, aku belum mendapatkan jawaban." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Terjadi masalah saat menghubungkan EduAI.",
      detail: process.env.NODE_ENV === "development" ? String(error.message) : undefined
    });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => console.log(`Eduverse.id berjalan di http://localhost:${PORT}`));
