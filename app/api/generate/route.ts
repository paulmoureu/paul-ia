import { NextResponse } from "next/server";
import { callClaude } from "@/lib/providers/anthropic";
import { callGemini } from "@/lib/providers/gemini";
import { callOpenAIImage } from "@/lib/providers/openai-image";
import { callOpenAI } from "@/lib/providers/openai";
import { callOpenAIVision } from "@/lib/providers/openai-vision";
import { callPerplexity } from "@/lib/providers/perplexity";
import { analyzeRequest } from "@/lib/router";
import { getServerApiKey } from "@/lib/server-api-keys";
import type { GenerateRequestBody, RouterAnalysis, StudentProfile, Workflow } from "@/types";

const defaultProfile: StudentProfile = {
  level: "lycée",
  subject: "droit",
  goal: "comprendre",
  style: "simple",
  responseMode: "normal",
  customInstructions: "",
};

const perplexityPrompt =
  "Tu es un moteur de recherche pour étudiants. Recherche des informations fiables, récentes et sourcées sur le sujet suivant. Réponds avec les points clés, les chiffres importants et les sources utiles. Ne rédige pas la réponse finale.";

const claudePrompt =
  "Tu es un expert en analyse et structuration pédagogique. À partir de la demande de l'étudiant et des éventuelles informations de recherche, construis une structure claire, logique et adaptée au niveau de l'étudiant. Ne fais pas trop littéraire, prépare une base solide.";

const openAiPrompt =
  "Tu es Paul IA, un assistant étudiant personnalisé. Tu réponds toujours d'abord toi-même avec OpenAI, de manière claire, utile, naturelle et adaptée au niveau, à la matière, à l'objectif, au style et au mode choisi par l'utilisateur.\n\nImportant:\n- Si le mode est “antisèche”, tu produis un résumé ultra-court pour réviser rapidement, jamais pour encourager la triche.\n- Si le mode est “fiche longue”, tu produis une fiche complète et structurée.\n- Si le mode est “normal”, tu réponds clairement et efficacement.\n- Pour les mathématiques niveau lycée, écris les formules avec des symboles standards et visibles: Δ, √, ×, ≤, ≥, ≠, ∈, ℝ quand c'est utile.\n- Écris les formules en LaTeX Markdown lisible: formules courtes entre $...$ et formules importantes seules entre $$...$$.\n- Ne mets jamais les formules dans un bloc de code. N'utilise pas de captures d'écran ni de pseudo-formules illisibles.\n- Pour une formule importante, donne aussi une ligne “Avec :” pour expliquer chaque symbole.\n\nÀ la fin de chaque réponse, ajoute une courte section intitulée “IA complémentaires possibles”. Dans cette section, propose 2 à 4 IA qui pourraient compléter la réponse selon le besoin: Perplexity pour les sources, Claude pour l'analyse longue ou le code, Gemini pour les documents longs ou multimodaux, Mistral/Codestral pour le français ou le code, GPT Image/Midjourney/Stable Diffusion pour l'image, ElevenLabs/OpenAI Audio/Whisper pour l'audio, Sora/Runway/Pika/HeyGen/Synthesia pour la vidéo. Explique en une phrase pourquoi chaque IA pourrait être utile.";

function requiredKeysForWorkflow(workflow: Workflow) {
  const keys: Record<Workflow, string[]> = {
    openai_only: ["OPENAI_API_KEY"],
    claude_only: ["ANTHROPIC_API_KEY"],
    perplexity_then_openai: ["PERPLEXITY_API_KEY", "OPENAI_API_KEY"],
    claude_then_openai: ["ANTHROPIC_API_KEY", "OPENAI_API_KEY"],
    perplexity_then_claude_then_openai: [
      "PERPLEXITY_API_KEY",
      "ANTHROPIC_API_KEY",
      "OPENAI_API_KEY",
    ],
    openai_image: ["OPENAI_API_KEY"],
    planned_image: [],
    planned_audio: [],
    planned_video: [],
    gemini_only: ["GOOGLE_GEMINI_API_KEY"],
  };

  return keys[workflow];
}

function hasRequiredKeys(workflow: Workflow) {
  return requiredKeysForWorkflow(workflow).every((key) => Boolean(getServerApiKey(key)));
}

function shouldUseOpenAIPrimary(analysis: RouterAnalysis) {
  return ![
    "openai_image",
    "planned_image",
    "planned_audio",
    "planned_video",
  ].includes(analysis.workflow);
}

function applyOpenAIPrimary(analysis: RouterAnalysis): RouterAnalysis {
  if (!shouldUseOpenAIPrimary(analysis) || !getServerApiKey("OPENAI_API_KEY")) {
    return analysis;
  }

  return {
    ...analysis,
    workflow: "openai_only",
    modelsUsed: ["OpenAI"],
    needsFinalWriting: true,
  };
}

function applyGeminiFallback(analysis: RouterAnalysis): RouterAnalysis {
  const canUseOriginalWorkflow = hasRequiredKeys(analysis.workflow);
  const canUseGemini = Boolean(getServerApiKey("GOOGLE_GEMINI_API_KEY"));

  if (
    analysis.workflow === "openai_image" ||
    analysis.workflow === "planned_image" ||
    analysis.workflow === "planned_audio" ||
    analysis.workflow === "planned_video" ||
    canUseOriginalWorkflow ||
    !canUseGemini
  ) {
    return analysis;
  }

  return {
    ...analysis,
    workflow: "gemini_only",
    modelsUsed: ["Gemini"],
    needsFinalWriting: false,
  };
}

function normalizeProfile(profile: Partial<StudentProfile>): StudentProfile {
  return {
    ...defaultProfile,
    ...profile,
    responseMode: profile.responseMode ?? "normal",
  };
}

function formatProfile(profile: StudentProfile) {
  return [
    `Niveau: ${profile.level}`,
    `Matière: ${profile.subject}`,
    `Objectif: ${profile.goal}`,
    `Style préféré: ${profile.style}`,
    `Mode de réponse: ${profile.responseMode}`,
    profile.customInstructions
      ? `Personnalisation libre: ${profile.customInstructions}`
      : "Personnalisation libre: aucune",
  ].join("\n");
}

function modeInstruction(profile: StudentProfile) {
  if (profile.responseMode === "fiche-longue") {
    return [
      "Mode fiche longue:",
      "- produire une fiche très complète",
      "- inclure définitions, explications, exemples, méthode, erreurs à éviter, mini-QCM et résumé final",
      "- structurer avec des titres clairs et des listes faciles à apprendre",
    ].join("\n");
  }

  if (profile.responseMode === "antiseche") {
    return [
      "Mode antisèche:",
      "- produire un résumé ultra-court pour réviser rapidement",
      "- ne jamais encourager la triche",
      "- inclure seulement les idées essentielles, formules clés, définitions à connaître et pièges à éviter",
      "- maximum 10 lignes sauf si vraiment nécessaire",
    ].join("\n");
  }

  return [
    "Mode normal:",
    "- répondre clairement et efficacement",
    "- adapter la structure au niveau, à la matière, à l'objectif et au style demandé",
  ].join("\n");
}

function buildStudentContext(request: string, profile: StudentProfile, additions?: string) {
  return [
    "Profil étudiant:",
    formatProfile(profile),
    "",
    "Demande:",
    request,
    "",
    modeInstruction(profile),
    "",
    "Consigne finale obligatoire:",
    "Après ta réponse principale, ajoute “IA complémentaires possibles” avec 2 à 4 IA utiles pour compléter, vérifier, sourcer, coder, créer une image, traiter l'audio ou produire une vidéo selon la demande.",
    additions ? `\nÉléments fournis:\n${additions}` : "",
  ].join("\n");
}

function buildDemoAnswer(request: string, profile: StudentProfile, analysis: RouterAnalysis) {
  const intro = `Voici une réponse démo pour ta demande: "${request}".`;
  const profileLine = `Paul IA l'adapte pour un profil ${profile.level}, en ${profile.subject}, avec un style ${profile.style}.`;

  if (analysis.taskType === "image") {
    return `${intro}\n\nPour que Paul IA crée vraiment l'image, ajoute une clé OPENAI_API_KEY dans le fichier CLES_API.txt. Ensuite, cette demande utilisera GPT Image côté serveur et l'image apparaîtra directement ici.\n\nIA choisie: GPT Image\nRaison: c'est le modèle prévu pour transformer une demande texte en image.`;
  }

  if (analysis.taskType === "vision") {
    return `${intro}\n\nPhoto détectée. En mode réel, Paul IA enverra l'image à OpenAI Vision côté serveur pour lire, expliquer, corriger ou résumer ce qui est visible.\n\nPour les maths, Paul IA écrira les formules avec des symboles lisibles et du LaTeX clair.`;
  }

  if (analysis.taskType === "audio") {
    return `${intro}\n\nCette demande est bien détectée comme audio. Les IA prévues sont ElevenLabs, OpenAI Audio et Whisper, mais elles ne sont pas encore branchées dans ce MVP.`;
  }

  if (analysis.taskType === "video") {
    return `${intro}\n\nCette demande est bien détectée comme vidéo. Les IA prévues sont Sora, Runway, Pika, HeyGen et Synthesia, mais elles ne sont pas encore branchées dans ce MVP.`;
  }

  if (profile.responseMode === "antiseche") {
    return `${intro}\n\nMode antisèche activé: résumé court pour réviser, pas pour tricher.\n1. Idée clé: comprendre ce qui est demandé.\n2. Définition: retenir les mots importants.\n3. Exemple: relier la notion à un cas concret.\n4. Piège: ne pas réciter sans expliquer.\n5. À retenir: clair, court, mémorisable.\n\nIA complémentaires possibles:\n- Perplexity: utile pour vérifier avec des sources récentes.\n- Claude: utile pour approfondir et structurer plus longuement.\n- Gemini: utile si tu ajoutes un document long ou multimodal.`;
  }

  if (analysis.outputFormat === "qcm") {
    return `${intro}\n\n${profileLine}\n\n1. Question exemple: quelle idée principale faut-il retenir ?\nA. Une idée secondaire\nB. L'idée centrale du cours\nC. Un détail hors sujet\n\nCorrection: B. L'objectif est de retenir l'idée centrale puis de la relier à un exemple simple.`;
  }

  if (analysis.taskType === "oral") {
    return `${intro}\n\n${profileLine}\n\nPlan oral proposé:\n1. Accroche courte\n2. Définition du sujet\n3. Deux idées fortes avec exemples\n4. Conclusion claire en une phrase\n\nPhrase de départ: Bonjour, aujourd'hui je vais expliquer le sujet simplement, en allant de l'idée principale vers un exemple concret.`;
  }

  if (analysis.taskType === "code") {
    return `${intro}\n\n${profileLine}\n\nAnalyse démo:\n- Le problème doit être isolé avec un exemple minimal.\n- La correction doit rester lisible et testable.\n- Paul IA expliquerait ensuite chaque ligne importante pour que tu puisses la réutiliser.`;
  }

  if (profile.responseMode === "fiche-longue") {
    return `${intro}\n\n${profileLine}\n\nFiche longue démo:\n\nDéfinition:\nIdentifier les notions importantes du sujet et les reformuler clairement.\n\nExplication:\nUne bonne réponse part de l'idée principale, puis ajoute des exemples et une méthode.\n\nExemple:\nPour réviser un cours, transforme chaque partie en question simple.\n\nMéthode:\n1. Lire le sujet\n2. Extraire les notions\n3. Ajouter un exemple\n4. Résumer en quelques lignes\n\nErreurs à éviter:\n- apprendre sans comprendre\n- oublier les exemples\n- écrire trop flou\n\nMini-QCM:\nQuelle est la première étape ? Réponse: comprendre le sujet.\n\nRésumé final:\nComprendre, structurer, illustrer, puis mémoriser.\n\nIA complémentaires possibles:\n- Perplexity: utile pour ajouter des sources et chiffres récents.\n- Claude: utile pour transformer cette fiche en analyse longue.\n- Gemini: utile si tu ajoutes un PDF, une image ou un document long.`;
  }

  return `${intro}\n\n${profileLine}\n\nRéponse démo:\n- Idée principale: identifier ce que le sujet demande vraiment.\n- Méthode: séparer définitions, exemples et points à mémoriser.\n- À retenir: une bonne réponse étudiante est claire, structurée et adaptée à l'objectif.\n\nMini-plan:\n1. Comprendre le sujet\n2. Repérer les notions importantes\n3. Rédiger ou réviser avec des phrases simples\n\nIA complémentaires possibles:\n- Perplexity: utile pour chercher des sources fiables.\n- Claude: utile pour approfondir ou analyser un long contenu.\n- Gemini: utile pour travailler avec des documents longs ou multimodaux.`;
}

async function runWorkflow(request: string, profile: StudentProfile, analysis: RouterAnalysis) {
  const context = buildStudentContext(request, profile);

  if (analysis.workflow === "gemini_only") {
    return callGemini(`${openAiPrompt}\n\n${context}`);
  }

  if (analysis.workflow === "claude_only") {
    return callClaude(claudePrompt, [{ role: "user", content: context }]);
  }

  if (analysis.workflow === "openai_only") {
    return callOpenAI([
      { role: "system", content: openAiPrompt },
      { role: "user", content: context },
    ]);
  }

  let searchNotes = "";
  let structuredNotes = "";

  if (
    analysis.workflow === "perplexity_then_openai" ||
    analysis.workflow === "perplexity_then_claude_then_openai"
  ) {
    searchNotes = await callPerplexity([
      { role: "system", content: perplexityPrompt },
      { role: "user", content: context },
    ]);
  }

  if (
    analysis.workflow === "claude_then_openai" ||
    analysis.workflow === "perplexity_then_claude_then_openai"
  ) {
    structuredNotes = await callClaude(claudePrompt, [
      {
        role: "user",
        content: buildStudentContext(request, profile, searchNotes),
      },
    ]);
  }

  return callOpenAI([
    { role: "system", content: openAiPrompt },
    {
      role: "user",
      content: buildStudentContext(
        request,
        profile,
        [searchNotes && `Recherche Perplexity:\n${searchNotes}`, structuredNotes && `Structure Claude:\n${structuredNotes}`]
          .filter(Boolean)
          .join("\n\n"),
      ),
    },
  ]);
}

function buildImagePrompt(request: string, profile: StudentProfile) {
  return [
    request,
    "",
    "Style attendu: image propre, utile pour un étudiant, sans texte incrusté sauf si explicitement demandé.",
    `Contexte utilisateur: niveau ${profile.level}, matière ${profile.subject}, objectif ${profile.goal}, style ${profile.style}, mode ${profile.responseMode}.`,
    profile.customInstructions
      ? `Consignes personnalisées à respecter: ${profile.customInstructions}`
      : "",
  ].join("\n");
}

function buildVisionPrompt(request: string, profile: StudentProfile) {
  return [
    "Tu es Paul IA, un assistant étudiant capable d'analyser une photo ou une image.",
    "Lis l'image avec attention et réponds à la demande de l'étudiant.",
    "",
    "Profil étudiant:",
    formatProfile(profile),
    "",
    "Demande:",
    request,
    "",
    modeInstruction(profile),
    "",
    "Consignes importantes:",
    "- Si l'image contient un exercice, explique la méthode avant de donner la réponse.",
    "- Si l'image contient du texte ou un cours, résume et structure clairement.",
    "- Si l'image contient du code, repère les erreurs visibles et propose une correction.",
    "- Si l'image contient des formules de mathématiques, réécris-les proprement avec les symboles standards du lycée: Δ, √, ×, ≤, ≥, ≠, ∈, ℝ quand c'est utile.",
    "- Écris les formules en LaTeX Markdown: formules courtes entre $...$ et formules importantes seules entre $$...$$.",
    "- Ne mets jamais les formules dans un bloc de code.",
    "",
    "Termine par une courte section “IA complémentaires possibles” avec 2 à 4 IA qui pourraient compléter la réponse.",
  ].join("\n");
}

function buildVisionAnalysis(request: string): RouterAnalysis {
  const lowerRequest = request.toLowerCase();
  const looksLikeCode = ["code", "bug", "python", "javascript", "next.js"].some((word) =>
    lowerRequest.includes(word),
  );

  return {
    taskType: "vision",
    needsWeb: false,
    needsLongAnalysis: false,
    needsFinalWriting: true,
    outputFormat: looksLikeCode ? "code" : "general",
    workflow: "openai_only",
    modelsUsed: ["OpenAI Vision"],
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateRequestBody;
    const hasImageAttachment = Boolean(body.imageAttachment?.dataUrl);
    const rawRequest = body.request?.trim() ?? "";
    const effectiveRequest = rawRequest || "Analyse cette photo et explique-moi clairement ce qu'il faut retenir.";

    if (!rawRequest && !hasImageAttachment) {
      return NextResponse.json({ error: "La demande est obligatoire." }, { status: 400 });
    }

    if (!body.profile) {
      return NextResponse.json({ error: "Le profil étudiant est obligatoire." }, { status: 400 });
    }

    const profile = normalizeProfile(body.profile);
    const analysis = hasImageAttachment
      ? buildVisionAnalysis(effectiveRequest)
      : applyGeminiFallback(applyOpenAIPrimary(analyzeRequest(effectiveRequest, profile)));

    if (hasImageAttachment) {
      if (!getServerApiKey("OPENAI_API_KEY")) {
        return NextResponse.json({
          ...analysis,
          finalAnswer: buildDemoAnswer(effectiveRequest, profile, analysis),
          providerNotes: [
            "Mode démo: aucune clé OPENAI_API_KEY n'est configurée côté serveur.",
            "La photo n'est pas envoyée à OpenAI en mode démo.",
          ],
          demoMode: true,
        });
      }

      const visionResult = await callOpenAIVision(
        buildVisionPrompt(effectiveRequest, profile),
        body.imageAttachment!,
      );

      return NextResponse.json({
        ...analysis,
        finalAnswer: visionResult.text,
        providerNotes: [
          `IA utilisée: OpenAI Vision (${visionResult.model}).`,
          `Niveau de détail image: ${visionResult.detail}.`,
          "La photo est envoyée côté serveur: la clé API n'est jamais exposée dans le navigateur.",
        ],
        demoMode: false,
      });
    }

    if (!hasRequiredKeys(analysis.workflow)) {
      return NextResponse.json({
        ...analysis,
        finalAnswer: buildDemoAnswer(effectiveRequest, profile, analysis),
        providerNotes: [
          "Mode démo: aucune clé API compatible n'est configurée côté serveur.",
          `IA qui aurait été utilisée: ${analysis.modelsUsed.join(", ")}.`,
        ],
        demoMode: true,
      });
    }

    if (analysis.workflow === "openai_image") {
      const generatedImage = await callOpenAIImage(buildImagePrompt(effectiveRequest, profile));

      return NextResponse.json({
        ...analysis,
        finalAnswer:
          "Image générée. Paul IA a choisi GPT Image car ta demande demande une création visuelle directe.",
        generatedImage: {
          ...generatedImage,
          provider: "OpenAI / GPT Image",
        },
        providerNotes: [
          `IA utilisée: OpenAI / GPT Image (${generatedImage.model}).`,
          `Options image: taille ${generatedImage.size}, qualité ${generatedImage.quality}, format ${generatedImage.format}.`,
          "La demande a été envoyée côté serveur: la clé API n'est jamais exposée dans le navigateur.",
        ],
        demoMode: false,
      });
    }

    if (
      analysis.workflow === "planned_image" ||
      analysis.workflow === "planned_audio" ||
      analysis.workflow === "planned_video"
    ) {
      return NextResponse.json({
        ...analysis,
        finalAnswer: buildDemoAnswer(effectiveRequest, profile, analysis),
        providerNotes: [
          "Ces IA sont présentes dans le catalogue, mais pas encore connectées dans ce MVP.",
        ],
        demoMode: true,
      });
    }

    const finalAnswer = await runWorkflow(effectiveRequest, profile, analysis);

    return NextResponse.json({
      ...analysis,
      finalAnswer,
      providerNotes: [
        `IA utilisée en premier: ${analysis.modelsUsed[0]}.`,
        "La réponse finale contient aussi des IA complémentaires possibles.",
      ],
      demoMode: false,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : "Paul IA n'a pas réussi à générer la réponse. Vérifie les clés API ou réessaie dans un instant.",
      },
      { status: 500 },
    );
  }
}
