"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  getCurrentFCMToken,
  getCurrentNotificationPermission,
  saveFCMToken,
  subscribeToForegroundPush,
} from "@/lib/notifications";
import { getSupabaseClient } from "@/lib/supabase";

export function GlobalPushListener() {
  const router = useRouter();

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    async function bootstrapPush() {
      const supabase = getSupabaseClient();

      if (!supabase) {
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active || !session) {
        return;
      }

      const permission = await getCurrentNotificationPermission();

      if (!active || permission !== "granted") {
        return;
      }

      const token = await getCurrentFCMToken();

      if (active && token) {
        const saveResult = await saveFCMToken(token);

        if (!saveResult.success) {
          console.error("[FCM] Global token sync failed:", saveResult.error);
        }
      }

      unsubscribe = await subscribeToForegroundPush((path) => {
        router.push(path);
      });
    }

    void bootstrapPush();

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [router]);

  return null;
}
