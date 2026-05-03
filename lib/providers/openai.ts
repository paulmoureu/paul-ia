import { getServerApiKey } from "@/lib/server-api-keys";

type OpenAiMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type OpenAIOptions = {
  model?: string;
};

function extractResponsesOutputText(data: {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string;
    }>;
  }>;
}) {
  if (data.output_text?.trim()) {
    return data.output_text.trim();
  }

  return data.output
    ?.flatMap((item) => item.content ?? [])
    .map((content) => content.text)
    .filter(Boolean)
    .join("\n")
    .trim() ?? "";
}

async function callOpenAIResponses(apiKey: string, model: string, messages: OpenAiMessage[]) {
  const instructions = messages
    .filter((message) => message.role === "system")
    .map((message) => message.content)
    .join("\n\n");
  const input = messages
    .filter((message) => message.role !== "system")
    .map((message) => ({
      role: message.role,
      content: [
        {
          type: "input_text",
          text: message.content,
        },
      ],
    }));

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      instructions,
      input,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI error: ${response.status} ${detail}`);
  }

  const data = (await response.json()) as {
    output_text?: string;
    output?: Array<{
      content?: Array<{
        text?: string;
      }>;
    }>;
  };

  return extractResponsesOutputText(data);
}

export async function callOpenAI(messages: OpenAiMessage[], options?: OpenAIOptions) {
  const apiKey = getServerApiKey("OPENAI_API_KEY");
  const model = options?.model ||
    getServerApiKey("OPENAI_MODEL") ||
    process.env.OPENAI_MODEL ||
    "gpt-5";

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  if (model.startsWith("gpt-5")) {
    return callOpenAIResponses(apiKey, model, messages);
  }

  const requestBody: {
    model: string;
    messages: OpenAiMessage[];
    temperature?: number;
  } = {
    model,
    messages,
  };

  if (!model.startsWith("gpt-5")) {
    requestBody.temperature = 0.6;
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
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
