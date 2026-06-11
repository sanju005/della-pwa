"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        return undefined;
      });
    }

    const media = window.matchMedia("(display-mode: standalone)");
    const isStandalone = media.matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setInstallEvent(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!installEvent) {
      return;
    }

    setIsInstalling(true);

    try {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;

      if (choice.outcome === "accepted") {
        setInstallEvent(null);
      }
    } finally {
      setIsInstalling(false);
    }
  }

  if (isInstalled || !installEvent) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 mx-auto w-[calc(100%-1.5rem)] max-w-[420px] rounded-[22px] border border-[#dce7df] bg-white/96 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.16)] backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[15px] font-extrabold text-[#0f172a]">Install DELLA app</p>
          <p className="mt-1 text-[13px] leading-5 text-[#64748b]">
            Add DELLA to your home screen for faster access.
          </p>
        </div>
        <button
          type="button"
          onClick={handleInstall}
          disabled={isInstalling}
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-[14px] bg-[#645394] px-4 text-[14px] font-extrabold text-white shadow-[0_12px_24px_rgba(100,83,148,0.24)] disabled:opacity-60"
        >
          {isInstalling ? "Opening..." : "Install"}
        </button>
      </div>
    </div>
  );
}
