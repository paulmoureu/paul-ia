export type ResponseMode = "normal" | "fiche-longue" | "antiseche";

export type StudentProfile = {
  level: string;
  subject: string;
  goal: string;
  style: string;
  responseMode: ResponseMode;
  customInstructions: string;
};

export type TaskType =
  | "research"
  | "writing"
  | "revision"
  | "oral"
  | "code"
  | "summary"
  | "vision"
  | "image"
  | "audio"
  | "video"
  | "mixed";

export type OutputFormat =
  | "fiche"
  | "script"
  | "qcm"
  | "plan"
  | "code"
  | "image"
  | "audio"
  | "video"
  | "resume"
  | "general";

export type Workflow =
  | "openai_only"
  | "claude_only"
  | "perplexity_then_openai"
  | "claude_then_openai"
  | "perplexity_then_claude_then_openai"
  | "openai_image"
  | "planned_image"
  | "planned_audio"
  | "planned_video"
  | "gemini_only";

export type AiStatus = "active" | "planned";

export type AiProviderId =
  | "openai"
  | "claude"
  | "perplexity"
  | "gemini"
  | "mistral"
  | "codestral"
  | "dalle"
  | "midjourney"
  | "stable-diffusion"
  | "adobe-firefly"
  | "elevenlabs"
  | "openai-audio"
  | "whisper"
  | "sora"
  | "runway"
  | "pika"
  | "heygen"
  | "synthesia";

export type AiCatalogItem = {
  id: AiProviderId;
  name: string;
  category:
    | "redaction"
    | "research"
    | "code"
    | "summary"
    | "oral"
    | "image"
    | "audio"
    | "video";
  strengths: string[];
  status: AiStatus;
};

export type RouterAnalysis = {
  taskType: TaskType;
  needsWeb: boolean;
  needsLongAnalysis: boolean;
  needsFinalWriting: boolean;
  outputFormat: OutputFormat;
  workflow: Workflow;
  modelsUsed: string[];
};

export type GenerateRequestBody = {
  request: string;
  profile: StudentProfile;
  imageAttachment?: ImageAttachment | null;
};

export type ImageAttachment = {
  dataUrl: string;
  name?: string;
  mimeType?: string;
};

export type GenerateResponse = RouterAnalysis & {
  finalAnswer: string;
  generatedImage?: {
    dataUrl?: string;
    url?: string;
    provider: string;
    model: string;
    revisedPrompt?: string;
    size?: string;
    quality?: string;
    format?: string;
  };
  providerNotes?: string[];
  demoMode?: boolean;
};

export type HistoryItem = {
  id: string;
  createdAt: string;
  request: string;
  profile: StudentProfile;
  response: GenerateResponse;
  hasImageAttachment?: boolean;
};
