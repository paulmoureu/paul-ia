import { getServerApiKey } from "@/lib/server-api-keys";

export type ElevenLabsSpeechResult = {
  audioDataUrl: string;
  model: string;
  voice: string;
  format: string;
  provider: "ElevenLabs";
};

function getElevenLabsOption(name: string, fallback: string) {
  return getServerApiKey(name) || process.env[name] || fallback;
}

function getMimeType(outputFormat: string) {
  if (outputFormat.includes("wav")) return "audio/wav";
  if (outputFormat.includes("pcm")) return "audio/pcm";
  if (outputFormat.includes("ulaw")) return "audio/basic";
  return "audio/mpeg";
}

export async function callElevenLabsSpeech(input: string): Promise<ElevenLabsSpeechResult> {
  const apiKey = getElevenLabsOption("ELEVENLABS_API_KEY", "");
  const voiceId = getElevenLabsOption("ELEVENLABS_VOICE_ID", "");
  const model = getElevenLabsOption("ELEVENLABS_MODEL_ID", "eleven_multilingual_v2");
  const outputFormat = getElevenLabsOption("ELEVENLABS_OUTPUT_FORMAT", "mp3_44100_128");

  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is missing");
  }

  if (!voiceId) {
    throw new Error("ELEVENLABS_VOICE_ID is missing");
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=${outputFormat}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: input,
        model_id: model,
        voice_settings: {
          stability: 0.48,
          similarity_boost: 0.82,
          style: 0.2,
          use_speaker_boost: true,
        },
      }),
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`ElevenLabs speech error: ${response.status} ${detail}`);
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());

  return {
    audioDataUrl: `data:${getMimeType(outputFormat)};base64,${audioBuffer.toString("base64")}`,
    model,
    voice: "Ma voix",
    format: outputFormat.includes("mp3") ? "mp3" : outputFormat,
    provider: "ElevenLabs",
  };
}
