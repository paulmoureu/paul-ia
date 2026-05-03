import type {
  ChatGptModelOption,
  ChatGptModelPreference,
  RouterAnalysis,
  StudentProfile,
} from "@/types";

export const chatGptModelOptions: ChatGptModelOption[] = [
  {
    id: "auto",
    label: "Auto - Paul IA choisit",
    description: "Paul IA sélectionne le modèle selon la difficulté.",
  },
  {
    id: "gpt-5.5",
    label: "Paul IA 5.5",
    description: "Meilleur choix pour les demandes complexes et le code exigeant.",
  },
  {
    id: "gpt-5.4",
    label: "Paul IA 5.4",
    description: "Très bon niveau général avec un bon équilibre qualité/prix.",
  },
  {
    id: "gpt-5.4-mini",
    label: "Paul IA 5.4 Mini",
    description: "Rapide et moins cher pour les réponses simples.",
  },
  {
    id: "gpt-5",
    label: "Paul IA 5",
    description: "Version Paul IA 5 classique pour une réponse solide.",
  },
  {
    id: "gpt-5-mini",
    label: "Paul IA 5 Mini",
    description: "Rapide pour les tâches courtes ou répétitives.",
  },
  {
    id: "gpt-5-nano",
    label: "Paul IA 5 Nano",
    description: "Très rapide pour résumer ou classer, moins adapté aux gros raisonnements.",
  },
];

export type ModelChoice = {
  model: Exclude<ChatGptModelPreference, "auto">;
  reason: string;
};

const availableModelIds = new Set(chatGptModelOptions.map((option) => option.id));

export function normalizeModelPreference(
  modelPreference?: string,
): ChatGptModelPreference {
  if (modelPreference && availableModelIds.has(modelPreference as ChatGptModelPreference)) {
    return modelPreference as ChatGptModelPreference;
  }

  return "auto";
}

export function chooseChatGptModel(
  modelPreference: ChatGptModelPreference | undefined,
  request: string,
  profile: StudentProfile,
  analysis: RouterAnalysis,
): ModelChoice {
  const preference = normalizeModelPreference(modelPreference);

  if (preference !== "auto") {
    return {
      model: preference,
      reason: "Modèle choisi manuellement par l'utilisateur.",
    };
  }

  const text = [
    request,
    profile.level,
    profile.subject,
    profile.goal,
    profile.style,
    profile.customInstructions,
  ]
    .join(" ")
    .toLowerCase();

  const asksForSpeed = ["rapide", "ultra-court", "court", "simple", "antisèche"].some((word) =>
    text.includes(word),
  );
  const asksForDepth = [
    "détaillé",
    "approfondir",
    "analyse",
    "fiche longue",
    "document long",
    "texte long",
  ].some((word) => text.includes(word));
  const isHardWork = analysis.taskType === "code" ||
    analysis.taskType === "research" ||
    analysis.taskType === "mixed" ||
    analysis.needsLongAnalysis ||
    asksForDepth;

  if (isHardWork) {
    return {
      model: "gpt-5.5",
      reason: "Paul IA a choisi Paul IA 5.5 pour une demande complexe ou exigeante.",
    };
  }

  if (asksForSpeed || profile.responseMode === "antiseche") {
    return {
      model: "gpt-5.4-mini",
      reason: "Paul IA a choisi Paul IA 5.4 Mini pour une réponse rapide et efficace.",
    };
  }

  if (analysis.taskType === "summary" || analysis.taskType === "revision") {
    return {
      model: "gpt-5.4",
      reason: "Paul IA a choisi Paul IA 5.4 pour une réponse pédagogique bien structurée.",
    };
  }

  return {
    model: "gpt-5",
    reason: "Paul IA a choisi Paul IA 5 comme modèle général solide.",
  };
}
