"use client";

import { ImagePlus, X } from "lucide-react";
import { useRef, useState } from "react";
import type { ImageAttachment } from "@/types";

type RequestBoxProps = {
  value: string;
  isLoading: boolean;
  imageAttachment?: ImageAttachment | null;
  onChange: (value: string) => void;
  onImageAttachmentChange?: (imageAttachment: ImageAttachment | null) => void;
  onSubmit: () => void;
};

const maxImageSize = 8 * 1024 * 1024;

export function RequestBox({
  value,
  isLoading,
  imageAttachment,
  onChange,
  onImageAttachmentChange,
  onSubmit,
}: RequestBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageError, setImageError] = useState("");
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

      <div className="rounded-lg border border-slate-200 bg-white p-4">
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
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-black text-ink transition hover:-translate-y-0.5 hover:border-lagoon hover:text-lagoon"
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
          <div className="mt-4 flex items-center gap-4 rounded-lg bg-paper p-3">
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
                Prête pour analyse OpenAI Vision
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onImageAttachmentChange?.(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-coral hover:text-coral"
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
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-ink px-6 py-3 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-lagoon disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:w-auto"
      >
        {isLoading ? "Paul IA réfléchit..." : "Générer avec Paul IA"}
      </button>
    </div>
  );
}
