"use client";

import { ImagePlus, Loader2, Mic, Square, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { displayModelName } from "@/lib/display-names";
import type { ImageAttachment } from "@/types";

type RequestBoxProps = {
  value: string;
  isLoading: boolean;
  accessCode?: string;
  imageAttachment?: ImageAttachment | null;
  onChange: (value: string) => void;
  onImageAttachmentChange?: (imageAttachment: ImageAttachment | null) => void;
  onSubmit: () => void;
};

const maxImageSize = 8 * 1024 * 1024;

export function RequestBox({
  value,
  isLoading,
  accessCode,
  imageAttachment,
  onChange,
  onImageAttachmentChange,
  onSubmit,
}: RequestBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const [imageError, setImageError] = useState("");
  const [audioError, setAudioError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionMeta, setTranscriptionMeta] = useState("");
  const canSubmit = Boolean(value.trim() || imageAttachment);

  function handleFileChange(file?: File) {
    setImageError("");

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Choisis une image au format PNG, JPG, WebP ou GIF.");
      return;
    }

    if (file.size > maxImageSize) {
      setImageError("L'image est trop lourde. Choisis une image de moins de 8 Mo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setImageError("Impossible de lire cette image.");
        return;
      }

      onImageAttachmentChange?.({
        dataUrl: reader.result,
        name: file.name,
        mimeType: file.type,
      });
    };
    reader.onerror = () => setImageError("Impossible de lire cette image.");
    reader.readAsDataURL(file);
  }

  function appendTranscript(text: string) {
    const cleanText = text.trim();

    if (!cleanText) return;

    onChange(value.trim() ? `${value.trim()}\n\n${cleanText}` : cleanText);
  }

  async function transcribeAudio(file: File) {
    setAudioError("");
    setTranscriptionMeta("");
    setIsTranscribing(true);

    try {
      const formData = new FormData();
      formData.append("audio", file);
      formData.append("accessCode", accessCode ?? "");

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Impossible de transcrire l'audio.");
      }

      appendTranscript(data.text);
      setTranscriptionMeta(`Transcription ${displayModelName(data.model)}`);
    } catch (caughtError) {
      setAudioError(
        caughtError instanceof Error
          ? caughtError.message
          : "Impossible de transcrire l'audio.",
      );
    } finally {
      setIsTranscribing(false);
    }
  }

  async function startRecording() {
    setAudioError("");
    setTranscriptionMeta("");

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setAudioError("L'enregistrement audio n'est pas disponible sur ce navigateur.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      audioChunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const audioFile = new File([audioBlob], "demande-vocale.webm", { type: mimeType });

        audioStreamRef.current?.getTracks().forEach((track) => track.stop());
        audioStreamRef.current = null;

        if (audioBlob.size > 0) {
          void transcribeAudio(audioFile);
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      setAudioError("Micro refusé ou indisponible. Tu peux aussi envoyer un fichier audio.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }

  function handleAudioFileChange(file?: File) {
    setAudioError("");

    if (!file) return;

    if (!file.type.startsWith("audio/") && !file.name.match(/\.(mp3|mp4|mpeg|mpga|m4a|wav|webm)$/i)) {
      setAudioError("Choisis un fichier audio: mp3, mp4, m4a, wav ou webm.");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setAudioError("Le fichier audio est trop lourd. Maximum 25 Mo.");
      return;
    }

    void transcribeAudio(file);
  }

  return (
    <div className="space-y-4">
      <label className="space-y-2">
        <span className="text-sm font-semibold text-ink">Ta demande</span>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Explique ce dont tu as besoin..."
          rows={7}
          className="w-full resize-none rounded-lg border border-slate-200 bg-white p-5 text-base leading-7 text-ink outline-none transition placeholder:text-slate-400 focus:border-lagoon focus:ring-4 focus:ring-lagoon/10"
        />
      </label>

      <div className="future-tile rounded-lg border p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black text-ink">Voix</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Dicte ta demande ou envoie un audio. Paul IA le transforme en texte.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isTranscribing}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${
                isRecording
                  ? "bg-coral text-white hover:bg-coral"
                  : "future-secondary-button hover:border-lagoon hover:text-lagoon"
              }`}
            >
              {isRecording ? (
                <Square className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Mic className="h-4 w-4" aria-hidden="true" />
              )}
              {isRecording ? "Arrêter" : "Parler"}
            </button>

            <button
              type="button"
              onClick={() => audioInputRef.current?.click()}
              disabled={isRecording || isTranscribing}
              className="future-secondary-button inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-black transition hover:-translate-y-0.5 hover:border-lagoon hover:text-lagoon disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {isTranscribing ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Upload className="h-4 w-4" aria-hidden="true" />
              )}
              {isTranscribing ? "Transcription..." : "Audio"}
            </button>
          </div>
        </div>

        <input
          ref={audioInputRef}
          type="file"
          accept="audio/mp3,audio/mp4,audio/mpeg,audio/mpga,audio/m4a,audio/wav,audio/webm,audio/*"
          className="sr-only"
          onChange={(event) => handleAudioFileChange(event.target.files?.[0])}
        />

        {audioError ? (
          <p className="mt-3 text-sm font-semibold text-coral">{audioError}</p>
        ) : null}

        {transcriptionMeta ? (
          <p className="mt-3 text-xs font-bold uppercase text-slate-500">
            {transcriptionMeta}
          </p>
        ) : null}
      </div>

      <div className="future-tile rounded-lg border p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black text-ink">Photo ou image</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Ajoute une photo d’exercice, de cours, de schéma ou de code à analyser.
            </p>
          </div>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="future-secondary-button inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-black transition hover:-translate-y-0.5 hover:border-lagoon hover:text-lagoon"
          >
            <ImagePlus className="h-4 w-4" aria-hidden="true" />
            Ajouter / prendre une photo
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/*"
          capture="environment"
          className="sr-only"
          onChange={(event) => handleFileChange(event.target.files?.[0])}
        />

        {imageError ? (
          <p className="mt-3 text-sm font-semibold text-coral">{imageError}</p>
        ) : null}

        {imageAttachment ? (
          <div className="future-tile mt-4 flex items-center gap-4 rounded-lg border p-3">
            <img
              src={imageAttachment.dataUrl}
              alt="Aperçu de l'image envoyée"
              className="h-20 w-20 rounded-md border border-slate-200 object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-ink">
                {imageAttachment.name ?? "Image ajoutée"}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase text-slate-500">
                Prête pour analyse Paul IA Vision
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onImageAttachmentChange?.(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="future-secondary-button inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:border-coral hover:text-coral"
              aria-label="Retirer l'image"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={isLoading || !canSubmit}
        className="future-primary-button inline-flex min-h-12 w-full items-center justify-center rounded-full px-6 py-3 text-sm font-black shadow-soft transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:w-auto"
      >
        {isLoading ? "Paul IA réfléchit..." : "Générer avec Paul IA"}
      </button>
    </div>
  );
}
