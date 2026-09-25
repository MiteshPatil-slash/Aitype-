import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function parseBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
}

const FALLBACK_PARAGRAPHS = {
  easy: [
    "Typing fast is a great skill that saves time and opens new creative paths. Practice every day with patience and focus.",
    "Small daily improvements over time lead to stunning results. Focus on accurate fingers before chasing high speed.",
    "Clear thoughts flow through steady keystrokes. Keep your wrists relaxed and maintain an easy breathing rhythm."
  ],
  medium: [
    "Technology has transformed the way we live, work, and communicate. It brings people closer, creates new opportunities, and solves real-world problems. By learning consistently and staying curious, we can build a better future for everyone around the world.",
    "Modern software engineering combines logical structure with human ingenuity. Every line of code bridges imagination and execution, helping millions solve practical challenges across industries and borders.",
    "Effective communication requires choosing words with precision and delivering them with clarity. Regular keyboard practice strengthens the neural connection between our thoughts and the digital page."
  ],
  hard: [
    "Algorithmic synthesis and asynchronous paradigms demand meticulous syntactic precision, whereas cryptographic verifiability underpins contemporary decentralized computational architectures.",
    "Comprehensive philosophical investigations reveal that epistemological frameworks continually adapt to technological ubiquity, prompting profound reexaminations of cognitive autonomy.",
    "Heterogeneous distributed systems necessitate robust fault-tolerant consensus mechanisms, ensuring sequential consistency across high-latency, partitioned network topologies."
  ]
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead ? res.writeHead(200).end() : res.status(200).end();
    return;
  }

  try {
    dotenv.config({ override: true });
    const body = await parseBody(req);
    const difficulty = (body.difficulty || "medium").toLowerCase();
    const topic = body.topic || "technology and personal growth";
    const focusKeys = body.focusKeys || [];

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      const fallbackList = FALLBACK_PARAGRAPHS[difficulty] || FALLBACK_PARAGRAPHS.medium;
      const randomText = fallbackList[Math.floor(Math.random() * fallbackList.length)];
      const response = { success: true, paragraph: randomText, source: "fallback" };
      if (res.status) return res.status(200).json(response);
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(response));
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Generate a single natural, continuous English paragraph suitable for a typing speed test.
Requirements:
- Difficulty Level: ${difficulty} (easy: simple common words; medium: natural everyday vocabulary and punctuation; hard: sophisticated vocabulary, technical or intellectual terms).
- Topic: ${topic}
- Length: approximately 60 to 90 words.
${focusKeys.length > 0 ? `- Focus Keys: Try to naturally incorporate words containing these characters: ${focusKeys.join(', ')}.` : ''}
- Do NOT include any titles, markdown formatting, quotes, bullet points, or numbering. Return ONLY the plain text paragraph.`;

    const modelsToTry = [
      "gemini-3.5-flash-lite",
      "gemini-3.5-flash",
      "gemini-3.6-flash",
      "gemini-flash-latest"
    ];

    let generatedText = null;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt
        });
        if (response && response.text) {
          generatedText = response.text.trim().replace(/^["']|["']$/g, '');
          break;
        }
      } catch (err) {
        console.warn(`[Generate Paragraph] Model ${model} failed, trying next...`);
      }
    }

    if (!generatedText) {
      const fallbackList = FALLBACK_PARAGRAPHS[difficulty] || FALLBACK_PARAGRAPHS.medium;
      generatedText = fallbackList[Math.floor(Math.random() * fallbackList.length)];
    }

    const payload = { success: true, paragraph: generatedText };
    if (res.status) return res.status(200).json(payload);
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(payload));
  } catch (err) {
    console.error("[Generate Paragraph Error]:", err);
    const fallbackList = FALLBACK_PARAGRAPHS.medium;
    const fallbackText = fallbackList[Math.floor(Math.random() * fallbackList.length)];
    const payload = { success: true, paragraph: fallbackText, error: err.message };
    if (res.status) return res.status(200).json(payload);
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(payload));
  }
}
