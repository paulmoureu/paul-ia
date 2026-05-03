"use client";

import { useMemo, useState } from "react";
import type { ResponseMode, StudentProfile } from "@/types";

type FieldName = Exclude<keyof StudentProfile, "responseMode" | "customInstructions">;

type Field = {
  name: FieldName;
  label: string;
  placeholder: string;
  suggestions: string[];
};

const fields: Field[] = [
  {
    name: "level",
    label: "Niveau",
    placeholder: "Rechercher ou écrire un niveau...",
    suggestions: [
      "primaire",
      "collège",
      "lycée",
      "CAP",
      "bac pro",
      "BTS",
      "BUT",
      "licence",
      "master",
      "école de commerce",
      "école d'ingénieur",
      "médecine",
      "droit",
      "prépa",
      "doctorat",
      "formation professionnelle",
      "autodidacte",
      "autre",
    ],
  },
  {
    name: "subject",
    label: "Matière",
    placeholder: "Rechercher ou écrire une matière...",
    suggestions: [
      "français",
      "philosophie",
      "histoire",
      "géographie",
      "économie",
      "droit",
      "management",
      "marketing",
      "finance",
      "comptabilité",
      "mathématiques",
      "physique",
      "chimie",
      "SVT",
      "informatique",
      "Python",
      "JavaScript",
      "anglais",
      "espagnol",
      "allemand",
      "communication",
      "UX/UI",
      "commerce",
      "négociation",
      "supply chain",
      "achats",
      "ressources humaines",
      "sociologie",
      "psychologie",
      "médecine",
      "biologie",
      "art",
      "musique",
      "autre",
    ],
  },
  {
    name: "goal",
    label: "Objectif",
    placeholder: "Rechercher ou écrire un objectif...",
    suggestions: [
      "comprendre",
      "réviser",
      "apprendre par cœur",
      "faire une fiche",
      "faire un résumé",
      "préparer un oral",
      "préparer un examen",
      "faire un devoir",
      "corriger un texte",
      "corriger du code",
      "créer un QCM",
      "créer des flashcards",
      "s'entraîner",
      "expliquer simplement",
      "approfondir",
      "gagner du temps",
      "autre",
    ],
  },
  {
    name: "style",
    label: "Style de réponse",
    placeholder: "Rechercher ou écrire un style...",
    suggestions: [
      "simple",
      "détaillé",
      "très pédagogique",
      "rapide",
      "ultra-court",
      "fiche longue",
      "antisèche",
      "oral naturel",
      "sérieux",
      "scolaire",
      "professionnel",
      "humain",
      "direct",
      "motivant",
      "drôle",
      "énervé mais clair",
      "comme un prof",
      "comme un pote",
      "autre",
    ],
  },
];

const responseModes: Array<{
  value: ResponseMode;
  label: string;
  description: string;
}> = [
  {
    value: "normal",
    label: "Normal",
    description: "Réponse claire, structurée et adaptée au profil.",
  },
  {
    value: "fiche-longue",
    label: "Fiche longue",
    description: "Définitions, exemples, méthode, erreurs, mini-QCM et résumé.",
  },
  {
    value: "antiseche",
    label: "Antisèche",
    description: "Résumé ultra-court pour réviser vite, jamais pour tricher.",
  },
];

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

type SearchableProfileFieldProps = {
  field: Field;
  value: string;
  onChange: (value: string) => void;
};

function SearchableProfileField({ field, value, onChange }: SearchableProfileFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  const filteredSuggestions = useMemo(() => {
    const query = normalize(value.trim());

    if (!query) {
      return field.suggestions.slice(0, 8);
    }

    return field.suggestions
      .filter((suggestion) => normalize(suggestion).includes(query))
      .slice(0, 8);
  }, [field.suggestions, value]);

  return (
    <div className="space-y-2">
      <label htmlFor={field.name} className="text-sm font-semibold text-ink">
        {field.label}
      </label>
      <input
        id={field.name}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => window.setTimeout(() => setIsFocused(false), 120)}
        placeholder={field.placeholder}
        className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-lagoon focus:ring-4 focus:ring-lagoon/10"
      />

      {isFocused ? (
        <div className="future-tile flex max-h-36 flex-wrap gap-2 overflow-y-auto rounded-lg border p-2 shadow-sm">
          {filteredSuggestions.length ? (
            filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onChange(suggestion)}
                className="future-secondary-button rounded-full px-3 py-1 text-xs font-semibold transition hover:border-lagoon hover:text-lagoon"
              >
                {suggestion}
              </button>
            ))
          ) : (
            <p className="px-2 py-1 text-xs text-slate-500">
              Garde ta valeur personnalisée.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

type ProfileFormProps = {
  profile: StudentProfile;
  onChange: (profile: StudentProfile) => void;
};

export function ProfileForm({ profile, onChange }: ProfileFormProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <SearchableProfileField
            key={field.name}
            field={field}
            value={profile[field.name] ?? ""}
            onChange={(value) =>
              onChange({
                ...profile,
                [field.name]: value,
              })
            }
          />
        ))}
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-ink">Mode de réponse</p>
        <div className="grid gap-3 lg:grid-cols-3">
          {responseModes.map((mode) => {
            const isSelected = profile.responseMode === mode.value;

            return (
              <button
                key={mode.value}
                type="button"
                onClick={() =>
                  onChange({
                    ...profile,
                    responseMode: mode.value,
                  })
                }
                className={`rounded-lg border p-4 text-left transition active:scale-[0.98] ${
                  isSelected
                    ? "border-lagoon bg-lagoon/20 text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                    : "future-secondary-button text-ink hover:border-lagoon"
                }`}
              >
                <span className="block text-sm font-black">{mode.label}</span>
                <span
                  className={`mt-2 block text-xs leading-5 ${
                    isSelected ? "text-white/85" : "text-slate-600"
                  }`}
                >
                  {mode.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="customInstructions" className="text-sm font-semibold text-ink">
          Personnalisation libre
        </label>
        <textarea
          id="customInstructions"
          value={profile.customInstructions ?? ""}
          onChange={(event) =>
            onChange({
              ...profile,
              customInstructions: event.target.value,
            })
          }
          rows={6}
          maxLength={6000}
          placeholder="Écris ici toutes tes consignes personnelles : ton niveau exact, ton prof, ton format préféré, les choses à éviter, le ton voulu, des exemples, tes difficultés..."
          className="min-h-40 w-full resize-y rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6 text-ink outline-none transition placeholder:text-slate-400 focus:border-lagoon focus:ring-4 focus:ring-lagoon/10"
        />
        <p className="text-xs text-slate-500">
          Tu peux écrire librement. Ce champ est envoyé à Paul IA pour personnaliser la réponse.
        </p>
      </div>
    </div>
  );
}
