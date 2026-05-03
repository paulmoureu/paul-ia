"use client";

import { useEffect, useState } from "react";
import { HistoryPanel } from "@/components/HistoryPanel";
import { ProfileForm } from "@/components/ProfileForm";
import { RequestBox } from "@/components/RequestBox";
import { ResultCard } from "@/components/ResultCard";
import type { GenerateResponse, HistoryItem, ImageAttachment, StudentProfile } from "@/types";

const initialProfile: StudentProfile = {
  level: "lycée",
  subject: "droit",
  goal: "comprendre",
  style: "simple",
  responseMode: "normal",
  customInstructions: "",
};

const maxHistoryItems = 30;

function prepareResultForStorage(result: GenerateResponse): GenerateResponse {
  if (!result.generatedImage?.dataUrl || result.generatedImage.dataUrl.length < 800000) {
    return result;
  }

  return {
    ...result,
    generatedImage: {
      ...result.generatedImage,
      dataUrl: undefined,
    },
  };
}

export default function Home() {
  const [profile, setProfile] = useState<StudentProfile>(initialProfile);
  const [studentRequest, setStudentRequest] = useState("");
  const [imageAttachment, setImageAttachment] = useState<ImageAttachment | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedLocalStorage, setHasLoadedLocalStorage] = useState(false);

  useEffect(() => {
    try {
      const savedProfile = window.localStorage.getItem("paul-ia-profile");
      const savedRequest = window.localStorage.getItem("paul-ia-request");
      const savedResult = window.localStorage.getItem("paul-ia-result");
      const savedHistory = window.localStorage.getItem("paul-ia-history");

      if (savedProfile) {
        setProfile({
          ...initialProfile,
          ...(JSON.parse(savedProfile) as Partial<StudentProfile>),
        });
      }

      if (savedRequest) {
        setStudentRequest(savedRequest);
      }

      if (savedResult) {
        setResult(JSON.parse(savedResult) as GenerateResponse);
      }

      if (savedHistory) {
        setHistory(JSON.parse(savedHistory) as HistoryItem[]);
      }
    } catch {
      window.localStorage.removeItem("paul-ia-profile");
      window.localStorage.removeItem("paul-ia-result");
      window.localStorage.removeItem("paul-ia-history");
    } finally {
      setHasLoadedLocalStorage(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedLocalStorage) return;
    window.localStorage.setItem("paul-ia-profile", JSON.stringify(profile));
  }, [hasLoadedLocalStorage, profile]);

  useEffect(() => {
    if (!hasLoadedLocalStorage) return;
    window.localStorage.setItem("paul-ia-request", studentRequest);
  }, [hasLoadedLocalStorage, studentRequest]);

  useEffect(() => {
    if (!hasLoadedLocalStorage) return;
    window.localStorage.setItem("paul-ia-history", JSON.stringify(history));
  }, [hasLoadedLocalStorage, history]);

  function saveResult(data: GenerateResponse) {
    const storableResult = prepareResultForStorage(data);
    setResult(storableResult);

    if (!storableResult.generatedImage?.dataUrl || storableResult.generatedImage.dataUrl.length < 800000) {
      window.localStorage.setItem("paul-ia-result", JSON.stringify(storableResult));
    } else {
      window.localStorage.removeItem("paul-ia-result");
    }

    setHistory((currentHistory) => {
      const historyItem: HistoryItem = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        request: studentRequest.trim() || "Analyse d'une photo",
        profile,
        response: storableResult,
        hasImageAttachment: Boolean(imageAttachment),
      };

      return [historyItem, ...currentHistory].slice(0, maxHistoryItems);
    });
  }

  function restoreHistoryItem(item: HistoryItem) {
    setProfile(item.profile);
    setStudentRequest(item.request);
    setImageAttachment(null);
    setError("");
    setResult(item.response);
    window.localStorage.setItem("paul-ia-result", JSON.stringify(item.response));
    window.location.hash = "assistant";
  }

  function clearHistory() {
    setHistory([]);
    window.localStorage.removeItem("paul-ia-history");
  }

  async function handleGenerate() {
    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          request: studentRequest,
          profile,
          imageAttachment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Une erreur est survenue.");
      }

      saveResult(data);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Paul IA n'a pas pu générer la réponse.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main>
      <section className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-7xl flex-col justify-center px-5 py-12 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase text-lagoon">Paul IA</p>
            <h1 className="mt-5 text-5xl font-black leading-[0.98] tracking-tight text-ink sm:text-6xl">
              L’assistant IA qui travaille comme un vrai copilote d’étude.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
              Tu écris ton besoin. Paul IA comprend ton profil, répond d’abord avec OpenAI, puis
              indique les autres IA qui pourraient compléter ton travail : sources, code, image,
              oral, résumé ou fiche de révision.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#assistant"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-ink px-7 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-lagoon active:scale-[0.98]"
              >
                Essayer Paul IA
              </a>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200/70 bg-white p-6 shadow-[0_24px_70px_-42px_rgba(24,34,48,0.42)]">
            <p className="text-sm font-black uppercase text-sage">Ce que l’outil fait</p>
            <div className="mt-5 divide-y divide-slate-200">
              <div className="py-4">
                <h2 className="text-xl font-black tracking-tight text-ink">Réponses adaptées</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Niveau, matière, objectif, style et consignes personnelles sont pris en compte.
                </p>
              </div>
              <div className="py-4">
                <h2 className="text-xl font-black tracking-tight text-ink">OpenAI en premier</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  La réponse principale est générée avec OpenAI, puis enrichie par des suggestions
                  d’IA complémentaires.
                </p>
              </div>
              <div className="py-4">
                <h2 className="text-xl font-black tracking-tight text-ink">Un outil pour apprendre</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Fiches, résumés, scripts d’oral, correction de code, QCM, recherche et images.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="assistant" className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-lg border border-white bg-white/90 p-6 shadow-soft sm:p-8">
            <div className="mb-6">
              <p className="text-xs font-black uppercase text-sage">
                Profil étudiant
              </p>
              <h2 className="mt-2 text-3xl font-black text-ink">Dis à Paul IA comment t'aider</h2>
            </div>
            <ProfileForm profile={profile} onChange={setProfile} />
          </div>

          <div className="rounded-lg border border-white bg-white/90 p-6 shadow-soft sm:p-8">
            <div className="mb-6">
              <p className="text-xs font-black uppercase text-sage">
                Demande
              </p>
              <h2 className="mt-2 text-3xl font-black text-ink">Explique ton besoin</h2>
            </div>
            <RequestBox
              value={studentRequest}
              isLoading={isLoading}
              imageAttachment={imageAttachment}
              onChange={setStudentRequest}
              onImageAttachmentChange={setImageAttachment}
              onSubmit={handleGenerate}
            />
          </div>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.25fr_0.75fr] xl:items-start">
          <ResultCard result={result} error={error} />
          <HistoryPanel
            history={history}
            onRestore={restoreHistoryItem}
            onClear={clearHistory}
          />
        </div>
      </section>
    </main>
  );
}
