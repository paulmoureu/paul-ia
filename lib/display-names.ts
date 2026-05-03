export function displayModelName(model?: string) {
  if (!model) return "";

  const normalizedModel = model.toLowerCase();

  if (normalizedModel === "gpt-5.5") return "Paul IA 5.5";
  if (normalizedModel === "gpt-5.4") return "Paul IA 5.4";
  if (normalizedModel === "gpt-5.4-mini") return "Paul IA 5.4 Mini";
  if (normalizedModel === "gpt-5") return "Paul IA 5";
  if (normalizedModel === "gpt-5-mini") return "Paul IA 5 Mini";
  if (normalizedModel === "gpt-5-nano") return "Paul IA 5 Nano";
  if (normalizedModel.includes("realtime")) return "Paul IA Vocal Live";
  if (normalizedModel.includes("image")) return "Paul IA Image";
  if (normalizedModel.includes("transcribe")) return "Paul IA Dictée";
  if (normalizedModel.includes("tts")) return "Paul IA Voix";
  if (normalizedModel.includes("eleven")) return "Paul IA Voix Perso";

  return model
    .replaceAll("OpenAI", "Paul IA")
    .replaceAll("GPT", "Paul IA")
    .replaceAll("gpt", "Paul IA");
}

export function displayProviderName(name?: string) {
  if (!name) return "";

  return name
    .replaceAll("OpenAI / GPT Image", "Paul IA Image")
    .replaceAll("OpenAI Vision", "Paul IA Vision")
    .replaceAll("GPT Image", "Paul IA Image")
    .replaceAll("OpenAI Audio", "Paul IA Audio")
    .replaceAll("ElevenLabs", "Paul IA Voix Perso")
    .replaceAll("OpenAI", "Paul IA")
    .replaceAll("ChatGPT", "Paul IA")
    .replaceAll("GPT", "Paul IA");
}
