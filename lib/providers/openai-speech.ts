import { getServerApiKey } from "@/lib/server-api-keys";

export type OpenAISpeechResult = {
  audioDataUrl: string;
  model: string;
  voice: string;
  format: string;
};

const supportedVoices = new Set([
  "alloy",
  "ash",
  "ballad",
  "coral",
  "echo",
  "fable",
  "nova",
  "onyx",
  "sage",
  "shimmer",
  "verse",
  "marin",
  "cedar",
]);

function getSpeechOption(name: string, fallback: string) {
  return getServerApiKey(name) || process.env[name] || fallback;
}

function getMimeType(format: string) {
  if (format === "wav") return "audio/wav";
  if (format === "opus") return "audio/opus";
  if (format === "aac") return "audio/aac";
  if (format === "flac") return "audio/flac";
  return "audio/mpeg";
}

export async function callOpenAISpeech(
  input: string,
  voicePreference?: string,
): Promise<OpenAISpeechResult> {
  const apiKey = getServerApiKey("OPENAI_API_KEY");
  const model = getSpeechOption("OPENAI_TTS_MODEL", "gpt-4o-mini-tts");
  const defaultVoice = getSpeechOption("OPENAI_TTS_VOICE", "marin");
  const voice = supportedVoices.has(voicePreference ?? "")
    ? voicePreference!
    : defaultVoice;
  const format = getSpeechOption("OPENAI_TTS_FORMAT", "mp3");

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      voice,
      input,
      response_format: format,
      instructions:
        "Voix claire, naturelle et pédagogique. Lire en français avec un rythme calme, comme un assistant étudiant.",
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI speech error: ${response.status} ${detail}`);
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());

  return {
    audioDataUrl: `data:${getMimeType(format)};base64,${audioBuffer.toString("base64")}`,
    model,
    voice,
    format,
  };
}
