import { getServerApiKey } from "@/lib/server-api-keys";

export type OpenAITranscriptionResult = {
  text: string;
  model: string;
};

function getTranscriptionOption(name: string, fallback: string) {
  return getServerApiKey(name) || process.env[name] || fallback;
}

export async function callOpenAITranscription(audioFile: File): Promise<OpenAITranscriptionResult> {
  const apiKey = getServerApiKey("OPENAI_API_KEY");
  const model = getTranscriptionOption("OPENAI_TRANSCRIBE_MODEL", "gpt-4o-transcribe");

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  const formData = new FormData();
  formData.append("file", audioFile);
  formData.append("model", model);
  formData.append("response_format", "text");
  formData.append(
    "prompt",
    "Transcris en français clair une demande d'étudiant pour Paul IA. Garde les termes de cours, de code, de maths et les noms propres.",
  );

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI transcription error: ${response.status} ${detail}`);
  }

  const text = (await response.text()).trim();

  if (!text) {
    throw new Error("OpenAI transcription response did not include text");
  }

  return {
    text,
    model,
  };
}
