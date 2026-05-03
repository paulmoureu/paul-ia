"use client";

import { Mic2, PhoneOff, Radio, Volume2 } from "lucide-react";
import { useRef, useState } from "react";
import { displayModelName } from "@/lib/display-names";
import type { StudentProfile } from "@/types";

type RealtimeVoiceAgentProps = {
  accessCode: string;
  profile: StudentProfile;
};

type VoiceStatus = "idle" | "connecting" | "live" | "error";

function getEphemeralKey(data: Record<string, unknown>) {
  const directValue = data.value;
  const clientSecret = data.client_secret;

  if (typeof directValue === "string") {
    return directValue;
  }

  if (typeof clientSecret === "string") {
    return clientSecret;
  }

  if (
    clientSecret &&
    typeof clientSecret === "object" &&
    "value" in clientSecret &&
    typeof clientSecret.value === "string"
  ) {
    return clientSecret.value;
  }

  return "";
}

export function RealtimeVoiceAgent({ accessCode, profile }: RealtimeVoiceAgentProps) {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [statusText, setStatusText] = useState("Prêt pour une conversation vocale.");
  const [sessionLabel, setSessionLabel] = useState("");

  function stopSession() {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;

    if (audioRef.current) {
      audioRef.current.srcObject = null;
    }

    setStatus("idle");
    setStatusText("Conversation vocale arrêtée.");
  }

  async function startSession() {
    setStatus("connecting");
    setStatusText("Connexion à l'agent vocal...");
    setSessionLabel("");

    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof RTCPeerConnection === "undefined") {
        throw new Error("Le mode vocal en direct n'est pas disponible sur ce navigateur.");
      }

      const tokenResponse = await fetch("/api/realtime/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessCode,
          profile,
        }),
      });
      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        throw new Error(tokenData.error ?? "Impossible de créer la session vocale.");
      }

      const ephemeralKey = getEphemeralKey(tokenData);

      if (!ephemeralKey) {
        throw new Error("Paul IA n'a pas renvoyé de clé éphémère pour le vocal.");
      }

      const peerConnection = new RTCPeerConnection();
      peerConnectionRef.current = peerConnection;

      const remoteAudio = new Audio();
      remoteAudio.autoplay = true;
      audioRef.current = remoteAudio;
      peerConnection.ontrack = (event) => {
        remoteAudio.srcObject = event.streams[0];
      };

      const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = localStream;
      localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

      const dataChannel = peerConnection.createDataChannel("oai-events");
      dataChannel.addEventListener("open", () => {
        setStatus("live");
        setStatusText("Agent vocal connecté. Tu peux parler naturellement.");
      });
      dataChannel.addEventListener("message", (event) => {
        try {
          const realtimeEvent = JSON.parse(event.data);

          if (realtimeEvent.type === "response.audio_transcript.done") {
            setStatusText("Réponse vocale terminée. Tu peux continuer à parler.");
          }

          if (realtimeEvent.type === "input_audio_buffer.speech_started") {
            setStatusText("Paul IA t'écoute...");
          }

          if (realtimeEvent.type === "response.created") {
            setStatusText("Paul IA répond à voix haute...");
          }
        } catch {
          setStatusText("Session vocale active.");
        }
      });

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      const sdpResponse = await fetch("https://api.openai.com/v1/realtime/calls", {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          "Content-Type": "application/sdp",
        },
      });

      if (!sdpResponse.ok) {
        throw new Error(await sdpResponse.text());
      }

      await peerConnection.setRemoteDescription({
        type: "answer",
        sdp: await sdpResponse.text(),
      });

      setSessionLabel(`${displayModelName(tokenData.model ?? "gpt-realtime-1.5")} · voix ${tokenData.voice ?? "marin"}`);
    } catch (error) {
      stopSession();
      setStatus("error");
      setStatusText(
        error instanceof Error
          ? error.message
          : "Impossible de lancer l'agent vocal.",
      );
    }
  }

  const isLive = status === "live" || status === "connecting";

  return (
    <section className="future-tile mb-5 rounded-lg border p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${
              status === "live"
                ? "bg-lagoon"
                : status === "connecting"
                  ? "bg-sage"
                  : status === "error"
                    ? "bg-coral"
                    : "bg-slate-300"
            }`} />
            <p className="text-sm font-black text-ink">Agent vocal en direct</p>
          </div>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Conversation audio en temps réel avec Paul IA Vocal Live.
          </p>
        </div>

        <button
          type="button"
          onClick={isLive ? stopSession : startSession}
          className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-black transition hover:-translate-y-0.5 ${
            isLive
              ? "bg-coral text-white hover:bg-coral"
              : "future-primary-button"
          }`}
        >
          {isLive ? (
            <PhoneOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Mic2 className="h-4 w-4" aria-hidden="true" />
          )}
          {isLive ? "Arrêter le vocal" : "Démarrer le vocal"}
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="future-tile rounded-lg border p-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Radio className="h-4 w-4 text-lagoon" aria-hidden="true" />
            {statusText}
          </p>
        </div>
        <div className="future-tile rounded-lg border p-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Volume2 className="h-4 w-4 text-lagoon" aria-hidden="true" />
            {sessionLabel || "Voix IA générée, pas une voix humaine."}
          </p>
        </div>
      </div>
    </section>
  );
}
