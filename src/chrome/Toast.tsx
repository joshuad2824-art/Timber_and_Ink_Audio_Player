"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { TOAST_MS } from "@/data/phrase";
import styles from "./Toast.module.css";

/**
 * The hand-lettered toast slot.
 *
 * Text in a reserved space, never an overlay — the slot keeps its height when
 * empty so nothing on the page reflows as a message arrives or goes.
 */
export function useToast(): [string, (message: string) => void] {
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const say = useCallback((text: string) => {
    setMessage(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(""), TOAST_MS);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return [message, say];
}

export function ToastSlot({ message }: { message: string }) {
  return (
    <div className={styles.slot} role="status" aria-live="polite">
      {message}
    </div>
  );
}
