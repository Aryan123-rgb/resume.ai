"use client";

import { useEffect, useRef } from "react";
import { syncUserData } from "@/action";

export function useAutoSave(projectId: string, formData: unknown) {
  const timerRef = useRef<number | null>(null);
  const latestDataRef = useRef<string>("");

  useEffect(() => {
    if (!projectId) {
      return;
    }

    const serialized = JSON.stringify(formData ?? {});
    if (serialized === latestDataRef.current) {
      return;
    }

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(async () => {
      latestDataRef.current = serialized;
      try {
        await syncUserData(projectId, formData ?? {});
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    }, 5000);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [projectId, formData]);
}
