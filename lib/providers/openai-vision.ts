import { getServerApiKey } from "@/lib/server-api-keys";
import type { ImageAttachment } from "@/types";

type OpenAIVisionResult = {
  text: string;
  model: string;
  detail: string;
};

function getVisionOption(name: string, fallback: string) {
  return getServerApiKey(name) || process.env[name] || fallback;
}

function extractOutputText(data: {
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

export async function callOpenAIVision(
  prompt: string,
  imageAttachment: ImageAttachment,
): Promise<OpenAIVisionResult> {
  const apiKey = getServerApiKey("OPENAI_API_KEY");
  const model = getVisionOption("OPENAI_VISION_MODEL", "gpt-4.1-mini");
  const detail = getVisionOption("OPENAI_VISION_DETAIL", "auto");

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: prompt,
            },
            {
              type: "input_image",
              image_url: imageAttachment.dataUrl,
              detail,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorDetail = await response.text();
    const lowerDetail = errorDetail.toLowerCase();

    if (lowerDetail.includes("insufficient_quota")) {
      throw new Error(
        "OpenAI refuse l'analyse de l'image car le quota ou les crédits API sont insuffisants.",
      );
    }

    throw new Error(`OpenAI vision error: ${response.status} ${errorDetail}`);
  }

  const data = (await response.json()) as {
    output_text?: string;
    output?: Array<{
      content?: Array<{
        text?: string;
      }>;
    }>;
  };
  const text = extractOutputText(data);

  if (!text) {
    throw new Error("OpenAI vision response did not include text");
  }

  return {
    text,
    model,
    detail,
  };
}
