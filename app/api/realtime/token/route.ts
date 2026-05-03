import { NextResponse } from "next/server";
import { getServerApiKey } from "@/lib/server-api-keys";
import type { StudentProfile } from "@/types";

type RealtimeTokenRequest = {
  accessCode?: string;
  profile?: Partial<StudentProfile>;
};

function hasValidAccessCode(accessCode?: string) {
  const expectedAccessCode = getServerApiKey("PAUL_IA_ACCESS_CODE") || process.env.PAUL_IA_ACCESS_CODE;

  if (!expectedAccessCode) {
    return true;
  }

  return accessCode?.trim() === expectedAccessCode.trim();
}

function buildRealtimeInstructions(profile?: Partial<StudentProfile>) {
  return [
    "Tu es Paul IA, un agent vocal pour étudiants.",
    "Tu réponds en français, de façon claire, naturelle et pédagogique.",
    "Tu aides à comprendre, réviser, préparer un oral, corriger du code, créer une fiche ou expliquer un cours.",
    "Réponds à voix haute avec des phrases courtes. Si la question est complexe, propose d'abord une structure simple.",
    "Indique clairement que tu es une voix générée par IA si l'utilisateur demande qui parle.",
    profile?.level ? `Niveau de l'étudiant: ${profile.level}` : "",
    profile?.subject ? `Matière: ${profile.subject}` : "",
    profile?.goal ? `Objectif: ${profile.goal}` : "",
    profile?.style ? `Style préféré: ${profile.style}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function POST(request: Request) {
  try {
    const apiKey = getServerApiKey("OPENAI_API_KEY");
    const body = (await request.json()) as RealtimeTokenRequest;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is missing" },
        { status: 500 },
      );
    }

    if (!hasValidAccessCode(body.accessCode)) {
      return NextResponse.json(
        { error: "Code d'accès incorrect. L'agent vocal est privé." },
        { status: 401 },
      );
    }

    const model = getServerApiKey("OPENAI_REALTIME_MODEL") ||
      process.env.OPENAI_REALTIME_MODEL ||
      "gpt-realtime-1.5";
    const voice = getServerApiKey("OPENAI_REALTIME_VOICE") ||
      process.env.OPENAI_REALTIME_VOICE ||
      "marin";

    const response = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session: {
          type: "realtime",
          model,
          instructions: buildRealtimeInstructions(body.profile),
          audio: {
            output: {
              voice,
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`OpenAI realtime token error: ${response.status} ${detail}`);
    }

    const data = await response.json();

    return NextResponse.json({
      ...data,
      model,
      voice,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : "Impossible de créer une session vocale.",
      },
      { status: 500 },
    );
  }
}
