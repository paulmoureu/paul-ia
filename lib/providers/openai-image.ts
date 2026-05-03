import { getServerApiKey } from "@/lib/server-api-keys";

export type OpenAIImageResult = {
  dataUrl?: string;
  url?: string;
  provider: "OpenAI";
  model: string;
  revisedPrompt?: string;
  size: string;
  quality: string;
  format: string;
};

function getImageOption(name: string, fallback: string) {
  return getServerApiKey(name) || process.env[name] || fallback;
}

function getMimeType(format: string) {
  if (format === "jpeg" || format === "jpg") return "image/jpeg";
  if (format === "webp") return "image/webp";
  return "image/png";
}

function buildImageRequestBody(prompt: string, model: string) {
  const size = getImageOption("OPENAI_IMAGE_SIZE", "auto");
  const quality = getImageOption("OPENAI_IMAGE_QUALITY", "auto");
  const format = getImageOption("OPENAI_IMAGE_FORMAT", "png");
  const moderation = getImageOption("OPENAI_IMAGE_MODERATION", "auto");
  const compression = getImageOption("OPENAI_IMAGE_COMPRESSION", "");
  const body: Record<string, string | number> = {
    model,
    prompt,
    size,
    quality,
    output_format: format,
    moderation,
    n: 1,
  };

  if ((format === "jpeg" || format === "webp") && compression) {
    body.output_compression = Number(compression);
  }

  return { body, size, quality, format };
}

export async function callOpenAIImage(prompt: string): Promise<OpenAIImageResult> {
  const apiKey = getServerApiKey("OPENAI_API_KEY");
  const model = getImageOption("OPENAI_IMAGE_MODEL", "gpt-image-2");

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  const { body, size, quality, format } = buildImageRequestBody(prompt, model);

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text();
    const lowerDetail = detail.toLowerCase();

    if (lowerDetail.includes("organization") && lowerDetail.includes("verification")) {
      throw new Error(
        "La génération d’image GPT Image nécessite la vérification de l’organisation OpenAI dans la console développeur.",
      );
    }

    if (lowerDetail.includes("insufficient_quota")) {
      throw new Error(
        "OpenAI refuse la génération d’image car le quota ou les crédits API sont insuffisants.",
      );
    }

    throw new Error(`OpenAI image error: ${response.status} ${detail}`);
  }

  const data = (await response.json()) as {
    data?: Array<{
      b64_json?: string;
      url?: string;
      revised_prompt?: string;
    }>;
  };

  const image = data.data?.[0];

  if (!image?.b64_json && !image?.url) {
    throw new Error("OpenAI image response did not include an image");
  }

  return {
    dataUrl: image.b64_json ? `data:${getMimeType(format)};base64,${image.b64_json}` : undefined,
    url: image.url,
    provider: "OpenAI",
    model,
    revisedPrompt: image.revised_prompt,
    size,
    quality,
    format,
  };
}
