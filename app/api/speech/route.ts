import { NextResponse } from "next/server";
import { callOpenAISpeech } from "@/lib/providers/openai-speech";
import { getServerApiKey } from "@/lib/server-api-keys";

type SpeechRequestBody = {
  text?: string;
  accessCode?: string;
  voice?: string;
};

function hasValidAccessCode(accessCode?: string) {
  const expectedAccessCode = getServerApiKey("PAUL_IA_ACCESS_CODE") || process.env.PAUL_IA_ACCESS_CODE;

  if (!expectedAccessCode) {
    return true;
  }

  return accessCode?.trim() === expectedAccessCode.trim();
}

function cleanTextForSpeech(text: string) {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\$\$([\s\S]*?)\$\$/g, "$1")
    .replace(/\$([^$]+)\$/g, "$1")
    .replace(/[#*_`>[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 7000);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SpeechRequestBody;
    const text = cleanTextForSpeech(body.text ?? "");

    if (!hasValidAccessCode(body.accessCode)) {
      return NextResponse.json(
        { error: "Code d'accès incorrect. L'écoute audio est privée." },
        { status: 401 },
      );
    }

    if (!text) {
      return NextResponse.json({ error: "Aucun texte à lire." }, { status: 400 });
    }

    const speech = await callOpenAISpeech(text, body.voice);

    return NextResponse.json({
      ...speech,
      disclosure: "Voix générée par IA.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : "Paul IA n'a pas réussi à générer l'audio.",
      },
      { status: 500 },
    );
  }
}
