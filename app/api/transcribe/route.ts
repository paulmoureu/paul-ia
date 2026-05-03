import { NextResponse } from "next/server";
import { callOpenAITranscription } from "@/lib/providers/openai-transcribe";
import { getServerApiKey } from "@/lib/server-api-keys";

function hasValidAccessCode(accessCode?: string) {
  const expectedAccessCode = getServerApiKey("PAUL_IA_ACCESS_CODE") || process.env.PAUL_IA_ACCESS_CODE;

  if (!expectedAccessCode) {
    return true;
  }

  return accessCode?.trim() === expectedAccessCode.trim();
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const accessCode = String(formData.get("accessCode") ?? "");
    const audio = formData.get("audio");

    if (!hasValidAccessCode(accessCode)) {
      return NextResponse.json(
        { error: "Code d'accès incorrect. La dictée vocale est privée." },
        { status: 401 },
      );
    }

    if (!(audio instanceof File)) {
      return NextResponse.json({ error: "Aucun audio reçu." }, { status: 400 });
    }

    if (audio.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Le fichier audio est trop lourd. Maximum 25 Mo." },
        { status: 400 },
      );
    }

    const transcription = await callOpenAITranscription(audio);

    return NextResponse.json(transcription);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : "Paul IA n'a pas réussi à transcrire l'audio.",
      },
      { status: 500 },
    );
  }
}
