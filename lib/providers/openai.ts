import { getServerApiKey } from "@/lib/server-api-keys";

type OpenAiMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function callOpenAI(messages: OpenAiMessage[]) {
  const apiKey = getServerApiKey("OPENAI_API_KEY");

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages,
      temperature: 0.6,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI error: ${response.status} ${detail}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return data.choices?.[0]?.message?.content?.trim() ?? "";
}
