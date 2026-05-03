import { getServerApiKey } from "@/lib/server-api-keys";

type PerplexityMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function callPerplexity(messages: PerplexityMessage[]) {
  const apiKey = getServerApiKey("PERPLEXITY_API_KEY");

  if (!apiKey) {
    throw new Error("PERPLEXITY_API_KEY is missing");
  }

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.PERPLEXITY_MODEL ?? "sonar",
      messages,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Perplexity error: ${response.status} ${detail}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return data.choices?.[0]?.message?.content?.trim() ?? "";
}
