import { getServerApiKey } from "@/lib/server-api-keys";

type GeminiPart = {
  text: string;
};

export async function callGemini(prompt: string) {
  const apiKey = getServerApiKey("GOOGLE_GEMINI_API_KEY");

  if (!apiKey) {
    throw new Error("GOOGLE_GEMINI_API_KEY is missing");
  }

  const model = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.5,
        },
      }),
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Gemini error: ${response.status} ${detail}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: GeminiPart[] } }>;
  };

  return data.candidates?.[0]?.content?.parts?.map((part) => part.text).join("\n").trim() ?? "";
}
