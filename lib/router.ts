import type {
  OutputFormat,
  RouterAnalysis,
  StudentProfile,
  TaskType,
  Workflow,
} from "@/types";

const workflowModels: Record<Workflow, string[]> = {
  openai_only: ["OpenAI"],
  claude_only: ["Claude"],
  perplexity_then_openai: ["Perplexity", "OpenAI"],
  claude_then_openai: ["Claude", "OpenAI"],
  perplexity_then_claude_then_openai: ["Perplexity", "Claude", "OpenAI"],
  openai_image: ["GPT Image"],
  planned_image: ["Midjourney", "Stable Diffusion", "Adobe Firefly"],
  planned_audio: ["ElevenLabs", "OpenAI Audio", "Whisper"],
  planned_video: ["Sora", "Runway", "Pika", "HeyGen", "Synthesia"],
  gemini_only: ["Gemini"],
};

const keywordGroups = {
  web: [
    "actualite",
    "recent",
    "sources",
    "source",
    "recherche",
    "statistiques",
    "statistique",
    "chiffres",
    "chiffre",
    "2025",
    "2026",
  ],
  code: [
    "code",
    "bug",
    "site web",
    "application",
    "fonction",
    "next.js",
    "python",
  ],
  revision: ["fiche", "revision", "revisions", "cours", "definition", "memo"],
  oral: ["oral", "script", "presentation", "discours"],
  summary: ["resume", "resumer", "synthese", "document", "texte long"],
  writing: ["redige", "ecris", "devoir", "dissertation", "introduction", "conclusion"],
  image: [
    "image",
    "photo",
    "dessin",
    "illustration",
    "visuel",
    "logo",
    "affiche",
    "genere une photo",
    "cree une photo",
    "fais une photo",
  ],
  audio: ["audio", "voix", "transcription", "transcris", "podcast", "mp3"],
  video: ["video", "sora", "runway", "pika", "heygen", "synthesia"],
  qcm: ["qcm", "quiz", "questionnaire"],
  plan: ["plan", "problematique", "structure"],
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function includesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

function countMatchedIntentGroups(text: string) {
  return (["web", "code", "revision", "oral", "summary", "writing"] as const).filter(
    (group) => includesAny(text, keywordGroups[group]),
  ).length;
}

function detectOutputFormat(text: string): OutputFormat {
  if (includesAny(text, keywordGroups.qcm)) return "qcm";
  if (includesAny(text, keywordGroups.image)) return "image";
  if (includesAny(text, keywordGroups.audio)) return "audio";
  if (includesAny(text, keywordGroups.video)) return "video";
  if (includesAny(text, keywordGroups.oral)) return "script";
  if (includesAny(text, keywordGroups.revision)) return "fiche";
  if (includesAny(text, keywordGroups.code)) return "code";
  if (includesAny(text, keywordGroups.summary)) return "resume";
  if (includesAny(text, keywordGroups.plan)) return "plan";
  return "general";
}

function isComplexRequest(text: string, profile: StudentProfile) {
  const intentCount = countMatchedIntentGroups(text);
  const asksForSeveralSteps = /\b(et|puis|avec|en plus|a la fois)\b/.test(text);
  const profileSuggestsMixedWork =
    normalize(profile.goal).includes("devoir") && includesAny(text, keywordGroups.web);

  return intentCount >= 3 || (intentCount >= 2 && asksForSeveralSteps) || profileSuggestsMixedWork;
}

export function analyzeRequest(
  userRequest: string,
  studentProfile: StudentProfile,
): RouterAnalysis {
  const text = normalize(`${userRequest} ${studentProfile.subject} ${studentProfile.goal}`);
  const outputFormat = detectOutputFormat(text);

  let taskType: TaskType = "writing";
  let workflow: Workflow = "openai_only";
  let needsWeb = false;
  let needsLongAnalysis = false;
  let needsFinalWriting = true;

  if (includesAny(text, keywordGroups.image)) {
    return {
      taskType: "image",
      needsWeb: false,
      needsLongAnalysis: false,
      needsFinalWriting: false,
      outputFormat: "image",
      workflow: "openai_image",
      modelsUsed: workflowModels.openai_image,
    };
  }

  if (includesAny(text, keywordGroups.audio)) {
    return {
      taskType: "audio",
      needsWeb: false,
      needsLongAnalysis: false,
      needsFinalWriting: false,
      outputFormat: "audio",
      workflow: "planned_audio",
      modelsUsed: workflowModels.planned_audio,
    };
  }

  if (includesAny(text, keywordGroups.video)) {
    return {
      taskType: "video",
      needsWeb: false,
      needsLongAnalysis: false,
      needsFinalWriting: false,
      outputFormat: "video",
      workflow: "planned_video",
      modelsUsed: workflowModels.planned_video,
    };
  }

  if (includesAny(text, keywordGroups.web)) {
    taskType = "research";
    needsWeb = true;
    workflow = "perplexity_then_openai";
  }

  if (includesAny(text, keywordGroups.code)) {
    taskType = "code";
    workflow = "claude_then_openai";
    needsLongAnalysis = true;
  }

  if (includesAny(text, keywordGroups.revision)) {
    taskType = "revision";
    workflow = "openai_only";
  }

  if (includesAny(text, keywordGroups.oral)) {
    taskType = "oral";
    workflow = "claude_then_openai";
    needsLongAnalysis = true;
  }

  if (includesAny(text, keywordGroups.summary)) {
    taskType = "summary";
    workflow = "claude_then_openai";
    needsLongAnalysis = true;
  }

  if (isComplexRequest(text, studentProfile)) {
    taskType = "mixed";
    needsWeb = includesAny(text, keywordGroups.web);
    needsLongAnalysis = true;
    workflow = needsWeb ? "perplexity_then_claude_then_openai" : "claude_then_openai";
  }

  if ((["claude_only", "gemini_only"] as Workflow[]).includes(workflow)) {
    needsFinalWriting = false;
  }

  return {
    taskType,
    needsWeb,
    needsLongAnalysis,
    needsFinalWriting,
    outputFormat,
    workflow,
    modelsUsed: workflowModels[workflow],
  };
}
