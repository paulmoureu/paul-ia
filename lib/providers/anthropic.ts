import { getServerApiKey } from "@/lib/server-api-keys";

type ClaudeMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function callClaude(system: string, messages: ClaudeMessage[]) {
  const apiKey = getServerApiKey("ANTHROPIC_API_KEY");

  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is missing");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-20241022",
      max_tokens: 1800,
      system,
      messages,
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Claude error: ${response.status} ${detail}`);
  }

  const data = (await response.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };

  return data.content
    ?.filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim() ?? "";
}
