"use client";

import type { GenerateResponse } from "@/types";
import { MarkdownAnswer } from "@/components/MarkdownAnswer";
import { Headphones, Loader2 } from "lucide-react";
import { displayModelName, displayProviderName } from "@/lib/display-names";
import { useState } from "react";

const workflowLabels: Record<string, string> = {
  openai_only: "Paul IA seul",
  claude_only: "Claude seul",
  perplexity_then_openai: "Perplexity puis Paul IA",
  claude_then_openai: "Claude puis Paul IA",
  perplexity_then_claude_then_openai: "Perplexity puis Claude puis Paul IA",
  openai_image: "Paul IA Image",
  planned_image: "IA image prévue",
  planned_audio: "IA audio prévue",
  planned_video: "IA vidéo prévue",
  gemini_only: "Gemini seul",
};

const taskLabels: Record<string, string> = {
  research: "Recherche sourcée",
  writing: "Rédaction",
  revision: "Révision",
  oral: "Oral",
  code: "Code",
  summary: "Résumé",
  vision: "Analyse d'image",
  image: "Image",
  audio: "Audio",
  video: "Vidéo",
  mixed: "Demande mixte",
};

const modelColors: Record<string, string> = {
  Perplexity: "border-cyan-300/25 bg-cyan-300/10 text-cyan-100",
  Claude: "border-amber-300/25 bg-amber-300/10 text-amber-100",
  "Paul IA": "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
  "Paul IA Vision": "border-sky-300/25 bg-sky-300/10 text-sky-100",
  "Paul IA Image": "border-rose-300/25 bg-rose-300/10 text-rose-100",
  OpenAI: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
  "OpenAI Vision": "border-sky-300/25 bg-sky-300/10 text-sky-100",
  "GPT Image": "border-rose-300/25 bg-rose-300/10 text-rose-100",
  Gemini: "border-teal-300/25 bg-teal-300/10 text-teal-100",
};

type ResultCardProps = {
  result: GenerateResponse | null;
  error?: string;
  accessCode?: string;
};

const voiceOptions = [
  { id: "elevenlabs", label: "Ma voix" },
  { id: "marin", label: "Marin" },
  { id: "cedar", label: "Cedar" },
  { id: "coral", label: "Coral" },
  { id: "alloy", label: "Alloy" },
  { id: "nova", label: "Nova" },
  { id: "sage", label: "Sage" },
];

export function ResultCard({ result, error, accessCode }: ResultCardProps) {
  const [voice, setVoice] = useState("elevenlabs");
  const [audioUrl, setAudioUrl] = useState("");
  const [audioMeta, setAudioMeta] = useState("");
  const [audioError, setAudioError] = useState("");
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  async function handleListen() {
    if (!result?.finalAnswer) return;

    setIsGeneratingAudio(true);
    setAudioError("");

    try {
      const response = await fetch("/api/speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: result.finalAnswer,
          accessCode,
          voice,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Impossible de générer l'audio.");
      }

      setAudioUrl(data.audioDataUrl);
      const provider = data.provider ? `${displayProviderName(data.provider)} · ` : "";
      setAudioMeta(`${provider}${displayModelName(data.model)} · voix ${data.voice} · ${data.format?.toUpperCase()}`);
    } catch (caughtError) {
      setAudioError(
        caughtError instanceof Error
          ? caughtError.message
          : "Impossible de générer l'audio.",
      );
    } finally {
      setIsGeneratingAudio(false);
    }
  }

  if (error) {
    return (
      <section className="future-panel rounded-2xl p-6 text-red-100">
        <h2 className="text-lg font-bold">Génération impossible</h2>
        <p className="mt-2 text-sm leading-6">{error}</p>
      </section>
    );
  }

  if (!result) {
    return (
      <section className="future-panel rounded-2xl border-dashed p-8 text-center text-slate-300">
        Ta réponse apparaîtra ici.
      </section>
    );
  }

  return (
    <section className="future-panel rounded-2xl p-6 sm:p-8">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-sage">Résultat</p>
          <h2 className="mt-2 text-2xl font-black text-ink">Réponse de Paul IA</h2>
          {result.demoMode ? (
            <p className="mt-2 text-sm font-semibold text-coral">Mode démo actif</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {result.modelsUsed.map((model) => (
            <span
              key={model}
              className={`rounded-full border px-3 py-1 text-xs font-bold ${
                modelColors[model] ?? "border-slate-200 bg-slate-50 text-slate-700"
              }`}
            >
              {displayProviderName(model)}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-4 py-6 sm:grid-cols-2">
        <div className="rounded-lg bg-paper p-4">
          <p className="text-xs font-bold uppercase text-slate-500">
            Type détecté
          </p>
          <p className="mt-2 font-bold text-ink">{taskLabels[result.taskType]}</p>
        </div>
        <div className="rounded-lg bg-paper p-4">
          <p className="text-xs font-bold uppercase text-slate-500">
            Workflow utilisé
          </p>
          <p className="mt-2 font-bold text-ink">{workflowLabels[result.workflow]}</p>
        </div>
        {result.selectedModel ? (
          <div className="rounded-lg bg-paper p-4 sm:col-span-2">
            <p className="text-xs font-bold uppercase text-slate-500">
              Version choisie
            </p>
            <p className="mt-2 font-bold text-ink">{displayModelName(result.selectedModel)}</p>
            {result.modelSelectionReason ? (
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {result.modelSelectionReason}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <MarkdownAnswer content={result.finalAnswer} />

      {!result.demoMode && result.finalAnswer ? (
        <div className="future-tile mt-5 rounded-lg border p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <label className="space-y-2">
              <span className="block text-xs font-bold uppercase text-slate-500">
                Voix
              </span>
              <select
                value={voice}
                onChange={(event) => setVoice(event.target.value)}
                className="min-h-11 rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-ink outline-none transition focus:border-lagoon focus:ring-4 focus:ring-lagoon/10"
              >
                {voiceOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={handleListen}
              disabled={isGeneratingAudio}
              className="future-primary-button inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {isGeneratingAudio ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Headphones className="h-4 w-4" aria-hidden="true" />
              )}
              {isGeneratingAudio ? "Préparation audio..." : "Écouter la réponse"}
            </button>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Voix générée par IA avec Paul IA Audio.
          </p>

          {audioError ? (
            <p className="mt-3 text-sm font-semibold text-coral">{audioError}</p>
          ) : null}

          {audioUrl ? (
            <div className="mt-4">
              <audio controls src={audioUrl} className="w-full" />
              {audioMeta ? (
                <p className="mt-2 text-xs font-bold uppercase text-slate-500">{audioMeta}</p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {result.generatedImage?.dataUrl || result.generatedImage?.url ? (
        <div className="future-tile mt-5 overflow-hidden rounded-lg border">
          <img
            src={result.generatedImage.dataUrl ?? result.generatedImage.url}
            alt="Image générée par Paul IA"
            className="h-auto w-full object-cover"
          />
          <div className="border-t border-slate-100 bg-white p-4 text-sm font-semibold text-slate-700">
            Image générée avec {displayProviderName(result.generatedImage.provider)} ({displayModelName(result.generatedImage.model)}) ·{" "}
            {result.generatedImage.size} · {result.generatedImage.quality} ·{" "}
            {result.generatedImage.format?.toUpperCase()}
          </div>
          {result.generatedImage.revisedPrompt ? (
            <div className="border-t border-slate-100 bg-white p-4 text-sm leading-6 text-slate-600">
              <span className="font-black text-ink">Prompt optimisé : </span>
              {result.generatedImage.revisedPrompt}
            </div>
          ) : null}
        </div>
      ) : null}

      {result.providerNotes?.length ? (
        <div className="future-tile mt-5 rounded-lg border p-4 text-sm leading-6 text-slate-700">
          {result.providerNotes.map((note) => (
            <p key={note}>{note}</p>
          ))}
        </div>
      ) : null}

      <p className="mt-5 text-sm font-semibold text-slate-600">
        Paul IA a choisi ce workflow car il correspond le mieux à ta demande.
      </p>
    </section>
  );
}
