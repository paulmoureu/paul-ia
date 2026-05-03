import type { GenerateResponse } from "@/types";
import { MarkdownAnswer } from "@/components/MarkdownAnswer";

const workflowLabels: Record<string, string> = {
  openai_only: "OpenAI seul",
  claude_only: "Claude seul",
  perplexity_then_openai: "Perplexity puis OpenAI",
  claude_then_openai: "Claude puis OpenAI",
  perplexity_then_claude_then_openai: "Perplexity puis Claude puis OpenAI",
  openai_image: "GPT Image",
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
  Perplexity: "border-cyan-200 bg-cyan-50 text-cyan-900",
  Claude: "border-orange-200 bg-orange-50 text-orange-900",
  OpenAI: "border-emerald-200 bg-emerald-50 text-emerald-900",
  "OpenAI Vision": "border-blue-200 bg-blue-50 text-blue-900",
  "GPT Image": "border-pink-200 bg-pink-50 text-pink-900",
  Gemini: "border-violet-200 bg-violet-50 text-violet-900",
};

type ResultCardProps = {
  result: GenerateResponse | null;
  error?: string;
};

export function ResultCard({ result, error }: ResultCardProps) {
  if (error) {
    return (
      <section className="rounded-lg border border-red-100 bg-red-50 p-6 text-red-900">
        <h2 className="text-lg font-bold">Génération impossible</h2>
        <p className="mt-2 text-sm leading-6">{error}</p>
      </section>
    );
  }

  if (!result) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-500">
        Ta réponse apparaîtra ici.
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-white bg-white p-6 shadow-soft sm:p-8">
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
              {model}
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
      </div>

      <MarkdownAnswer content={result.finalAnswer} />

      {result.generatedImage?.dataUrl || result.generatedImage?.url ? (
        <div className="mt-5 overflow-hidden rounded-lg border border-slate-100 bg-paper">
          <img
            src={result.generatedImage.dataUrl ?? result.generatedImage.url}
            alt="Image générée par Paul IA"
            className="h-auto w-full object-cover"
          />
          <div className="border-t border-slate-100 bg-white p-4 text-sm font-semibold text-slate-700">
            Image générée avec {result.generatedImage.provider} ({result.generatedImage.model}) ·{" "}
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
        <div className="mt-5 rounded-lg bg-paper p-4 text-sm leading-6 text-slate-700">
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
