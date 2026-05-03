"use client";

import { Clock3, ImageIcon, RotateCcw, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { HistoryItem } from "@/types";

const taskLabels: Record<string, string> = {
  research: "Recherche",
  writing: "Rédaction",
  revision: "Révision",
  oral: "Oral",
  code: "Code",
  summary: "Résumé",
  vision: "Image analysée",
  image: "Image générée",
  audio: "Audio",
  video: "Vidéo",
  mixed: "Mixte",
};

type HistoryPanelProps = {
  history: HistoryItem[];
  onRestore: (item: HistoryItem) => void;
  onClear: () => void;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function HistoryPanel({ history, onRestore, onClear }: HistoryPanelProps) {
  const [query, setQuery] = useState("");
  const filteredHistory = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) return history;

    return history.filter((item) => {
      const haystack = [
        item.request,
        item.response.finalAnswer,
        item.profile.level,
        item.profile.subject,
        item.profile.goal,
        item.profile.style,
        item.response.taskType,
        item.response.modelsUsed.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(search);
    });
  }, [history, query]);

  return (
    <aside className="future-panel rounded-2xl p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase text-sage">Historique</p>
          <h2 className="mt-2 text-2xl font-black text-ink">Recherches passées</h2>
        </div>

        {history.length ? (
          <button
            type="button"
            onClick={onClear}
            className="future-secondary-button inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition hover:border-coral hover:text-coral"
            aria-label="Effacer l'historique"
            title="Effacer l'historique"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <label className="future-tile mt-5 flex min-h-11 items-center gap-3 rounded-full border px-4 text-sm text-slate-700 focus-within:border-lagoon focus-within:ring-4 focus-within:ring-lagoon/10">
        <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher dans l'historique..."
          className="w-full bg-transparent font-semibold outline-none placeholder:text-slate-400"
        />
      </label>

      <div className="mt-5 max-h-[34rem] space-y-3 overflow-y-auto pr-1">
        {!history.length ? (
          <div className="future-tile rounded-lg border border-dashed p-5 text-sm leading-6 text-slate-600">
            Tes prochaines recherches apparaîtront ici automatiquement.
          </div>
        ) : null}

        {history.length && !filteredHistory.length ? (
          <div className="future-tile rounded-lg border border-dashed p-5 text-sm leading-6 text-slate-600">
            Aucun résultat dans ton historique pour cette recherche.
          </div>
        ) : null}

        {filteredHistory.map((item) => (
          <article
            key={item.id}
            className="future-tile rounded-lg border p-4 transition hover:border-lagoon/40 hover:-translate-y-0.5 hover:shadow-[0_18px_60px_-38px_rgba(56,189,248,0.72)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-black leading-6 text-ink">
                  {item.request}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                    {formatDate(item.createdAt)}
                  </span>
                  <span className="rounded-full bg-paper px-2 py-1">
                    {taskLabels[item.response.taskType] ?? item.response.taskType}
                  </span>
                  {item.hasImageAttachment ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-blue-800">
                      <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      photo
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
              {item.response.finalAnswer}
            </p>

            <button
              type="button"
              onClick={() => onRestore(item)}
              className="future-secondary-button mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-black uppercase transition hover:border-lagoon hover:text-lagoon"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Revoir
            </button>
          </article>
        ))}
      </div>
    </aside>
  );
}
