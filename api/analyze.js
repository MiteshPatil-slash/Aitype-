import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

/**
 * Pre-computes error analysis from actual typing data
 */
function analyzeTypingErrors(paragraph = "", typedText = "") {
  const mistypedMap = {};
  let correctCount = 0;
  let incorrectCount = 0;

  const minLen = Math.min(paragraph.length, typedText.length);
  for (let i = 0; i < minLen; i++) {
    const expected = paragraph[i];
    const actual = typedText[i];
    if (expected === actual) {
      correctCount++;
    } else {
      incorrectCount++;
      const charKey = expected.toLowerCase();
      const displayKey = charKey === " " ? "space" : charKey;
      mistypedMap[displayKey] = (mistypedMap[displayKey] || 0) + 1;
    }
  }

  if (typedText.length > paragraph.length) {
    incorrectCount += typedText.length - paragraph.length;
  }

  const mistypedKeys = Object.entries(mistypedMap)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return {
    correctCount,
    incorrectCount,
    totalTyped: typedText.length,
    mistypedKeys
  };
}

/**
 * Helper to parse body if passed as string or stream
 */
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

/**
 * Main Vercel Serverless Function & Local Dev Handler
 */
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.writeHead ? res.writeHead(200).end() : res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    const errorPayload = { success: false, error: "Method not allowed. Use POST." };
    if (res.status) {
      return res.status(405).json(errorPayload);
    }
    res.writeHead(405, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(errorPayload));
  }

  try {
    dotenv.config({ override: true });
    const body = await parseBody(req);
    const {
      paragraph = "",
      typedText = "",
      wpm = 0,
      accuracy = 0,
      errors = 0,
      elapsedTime = 60,
      difficulty = "Medium",
      duration = 60
    } = body;

    // Pre-calculate character-level error breakdown
    const errorDetails = analyzeTypingErrors(paragraph, typedText);
    const mistypedKeys = errorDetails.mistypedKeys;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "YOUR_NEW_GEMINI_API_KEY" || apiKey === "your_gemini_api_key_here") {
      console.warn("[TypeAI Backend] GEMINI_API_KEY is not set in environment.");
      const missingKeyResponse = {
        success: false,
        error: "GEMINI_API_KEY is not configured on the server. Please add your GEMINI_API_KEY in .env.",
        isConfigError: true
      };
      if (res.status) {
        return res.status(500).json(missingKeyResponse);
      }
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(missingKeyResponse));
    }

    // Initialize Google Gemini via official @google/genai SDK
    const ai = new GoogleGenAI({ apiKey });

    const isVeryLowAccuracy = accuracy < 50;
    const isMediumAccuracy = accuracy >= 50 && accuracy < 85;
    const isHighAccuracy = accuracy >= 85;

    const systemInstruction = `You are TypeAI, an expert, honest typing coach.
Your job is to objectively analyze the user's actual typing session data and provide realistic, strictly personalized coaching feedback.
CRITICAL RULES:
1. NEVER give false praise. If the user had low accuracy, typed random characters, or had many mistakes, DO NOT say "Great job", "Excellent", or "Good momentum". Point out directly that accuracy was low or that keystrokes did not match the target text.
2. If accuracy < 50% or errors are high:
   - overallPerformance must be "Needs Serious Practice" or "Low Accuracy - Slow Down".
   - summary must candidly explain that only ${accuracy}% accuracy was reached with ${errors} errors, and that keystrokes frequently did not match the target paragraph.
   - commonErrors must list specific issues like typing incorrect characters, pressing keys without checking screen, or rushing before mastering key locations.
   - suggestions must advise slowing down dramatically to 15-25 WPM, placing fingers on the home row, and verifying each letter.
3. If accuracy is 50% to 84%:
   - overallPerformance must be "Needs Practice" or "Fair Accuracy".
   - Identify the specific keys that tripped them up (${mistypedKeys.map(k => k.key).join(', ') || 'various character transitions'}).
4. If accuracy is 85% or higher:
   - overallPerformance can be "Very Good" or "Excellent".
5. DYNAMIC PRACTICE PARAGRAPH:
   - You MUST generate a brand new, natural, coherent English paragraph of 70 to 110 words.
   - The paragraph MUST be specifically designed to help the user practice their actual weaknesses and mistyped keys.
   - If they struggled with specific keys (${mistypedKeys.map(k => k.key).join(', ') || 'home row keys'}), naturally weave words containing those letters into the text.
   - If accuracy was very low, create clean, simple everyday words to rebuild muscle memory.
   - whyThisParagraph must explain exactly which keys or error patterns this paragraph targets based on their test.
6. Return ONLY valid JSON matching the exact schema without markdown backticks.`;

    const prompt = `Typing Session Data:
- Target Paragraph: "${paragraph}"
- User Typed Text: "${typedText}"
- Recorded WPM: ${wpm}
- Accuracy: ${accuracy}%
- Total Errors: ${errors}
- Elapsed Time: ${elapsedTime}s
- Selected Difficulty: ${difficulty}
- Selected Duration: ${duration}s
- Mistyped Keys Detected: ${JSON.stringify(mistypedKeys)}

Return valid JSON with this exact structure:
{
  "overallPerformance": "Short assessment (e.g. Excellent, Very Good, Needs Practice, or Low Accuracy - Slow Down)",
  "summary": "1-2 honest sentences summarizing their actual performance, rhythm, and accuracy",
  "mistypedKeys": [
    { "key": "e", "count": 4 }
  ],
  "commonErrors": [
    "description of actual error pattern observed in their typing"
  ],
  "suggestions": [
    "personalized suggestion 1",
    "personalized suggestion 2",
    "personalized suggestion 3"
  ],
  "practiceFocus": "specific character combinations or habits to target",
  "nextParagraph": "A 70-110 word natural, readable English practice paragraph at ${difficulty} difficulty that incorporates words with their weak keys (${mistypedKeys.map(k => k.key).join(', ') || 'home row'})",
  "whyThisParagraph": "1-2 sentences explaining why this paragraph was generated and how it addresses their specific mistakes"
}`;

    // Try current high-availability flash models for this API key
    const modelsToTry = [
      "gemini-3.5-flash-lite",
      "gemini-3.5-flash",
      "gemini-3.6-flash",
      "gemini-flash-latest"
    ];
    let aiResponse = null;
    let lastError = null;

    for (const model of modelsToTry) {
      try {
        aiResponse = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: "application/json"
          }
        });
        if (aiResponse) break;
      } catch (err) {
        lastError = err;
        console.warn(`[TypeAI Backend] Model ${model} failed, trying next fallback...`, err.message);
      }
    }

    if (!aiResponse) {
      throw lastError || new Error("All Gemini models failed to respond.");
    }

    const responseText = aiResponse.text;
    let parsedAnalysis = {};

    try {
      parsedAnalysis = JSON.parse(responseText);
    } catch {
      // Clean possible markdown code fences if any
      const cleaned = responseText.replace(/```(?:json)?/g, "").replace(/```/g, "").trim();
      parsedAnalysis = JSON.parse(cleaned);
    }

    // Ensure fallback fields are present if Gemini omitted any, maintaining strict honesty
    const finalizedAnalysis = {
      overallPerformance: parsedAnalysis.overallPerformance || (
        isHighAccuracy ? "Excellent" :
        isMediumAccuracy ? "Fair - Needs Practice" :
        "Needs Serious Practice"
      ),
      summary: parsedAnalysis.summary || (
        isVeryLowAccuracy
          ? `Recorded accuracy was ${accuracy}% with ${errors} mistakes. Keystrokes frequently did not match the target text. Slow down and prioritize typing each letter accurately.`
          : isMediumAccuracy
          ? `You achieved ${wpm} WPM with ${accuracy}% accuracy. Focus on key combinations around "${mistypedKeys[0]?.key || 'weak keys'}" to improve consistency.`
          : `Strong performance with ${wpm} WPM and ${accuracy}% accuracy. Maintain this rhythm as you build speed.`
      ),
      mistypedKeys: parsedAnalysis.mistypedKeys && parsedAnalysis.mistypedKeys.length > 0
        ? parsedAnalysis.mistypedKeys
        : (mistypedKeys.length > 0 ? mistypedKeys : []),
      commonErrors: parsedAnalysis.commonErrors || (
        isVeryLowAccuracy
          ? ["Pressing incorrect keys repeatedly", "Typing without verifying text on screen", "Rushing speed before mastering accuracy"]
          : [`Difficulty with "${mistypedKeys[0]?.key || 'key'}" transitions`, "Inconsistent keystroke tempo"]
      ),
      suggestions: parsedAnalysis.suggestions || (
        isVeryLowAccuracy
          ? ["Slow down your typing speed completely", "Look at the screen and verify each letter before pressing", "Practice basic home-row finger positioning"]
          : ["Focus on maintaining steady finger placement", "Practice smooth transitions between common digraphs", "Aim for 98%+ accuracy before increasing speed"]
      ),
      practiceFocus: parsedAnalysis.practiceFocus || (
        mistypedKeys.length > 0
          ? `Practice keys: ${mistypedKeys.map(k => k.key).join(", ")}`
          : "Home-row accuracy and speed development"
      ),
      nextParagraph: parsedAnalysis.nextParagraph || (
        isVeryLowAccuracy
          ? "Start with steady and simple words to build your finger memory. Keep your hands resting gently on the keyboard. Take your time with every single letter before you press it. Speed will come naturally once your fingers know where every key is placed. Focus on hitting the right key every time."
          : `Through the trees, a train traveled across the track, carrying travelers to their destinations. The bright morning brought fresh thoughts and new opportunities to create a better tomorrow.`
      ),
      whyThisParagraph: parsedAnalysis.whyThisParagraph || (
        mistypedKeys.length > 0
          ? `Tailored practice targeting your mistyped keys: ${mistypedKeys.map(k => k.key).join(", ")}.`
          : "Structured practice paragraph designed to build steady rhythm and finger muscle memory."
      )
    };

    const successPayload = {
      success: true,
      analysis: finalizedAnalysis
    };

    if (res.status) {
      return res.status(200).json(successPayload);
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(successPayload));

  } catch (err) {
    console.error("[TypeAI Backend] Analysis error:", err);
    const failurePayload = {
      success: false,
      error: "AI analysis is temporarily unavailable"
    };
    if (res.status) {
      return res.status(500).json(failurePayload);
    }
    res.writeHead(500, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(failurePayload));
  }
}
