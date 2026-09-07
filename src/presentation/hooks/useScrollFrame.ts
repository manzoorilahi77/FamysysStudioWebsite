"use client";

import { useEffect } from "react";

/**
 * THE PAGE'S ONE SCROLL-DRIVEN FRAME.
 *
 * Three homepage sections move with the scroll — the process frames handing the screen to
 * one another, the work covers panning inside their windows — and each of them needs the
 * same thing: measure, then write, once per paint. Given a loop each they would be three
 * schedulers competing for the same frame, which is the mistake `useHeroMotion` records at
 * the top of its own file.
 *
 * So there is one. Scroll and resize only mark the frame dirty; a single
 * `requestAnimationFrame` runs every registered task and then stops. Nothing here is a
 * standing loop: with no scrolling there is no frame scheduled, and with no subscribers
 * there are no listeners attached either. That is the same shape `useScrollProgress` and
 * `useScrollSequence` already use, shared rather than repeated.
 *
 * A TASK MUST READ EVERY RECT IT NEEDS BEFORE IT WRITES A SINGLE STYLE. Tasks run one
 * after another inside one callback, so a write in the middle of one invalidates the
 * layout the next one is about to read. Each task below batches its own reads; keeping
 * them in one frame is what makes that worth doing.
 */
type FrameTask = () => void;

const tasks = new Set<FrameTask>();
let frame = 0;
let listening = false;

function run(): void {
  frame = 0;
  for (const task of tasks) {
    task();
  }
}

function schedule(): void {
  if (frame === 0) {
    frame = window.requestAnimationFrame(run);
  }
}

function listen(): void {
  if (listening) {
    return;
  }
  listening = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
}

function stopListening(): void {
  if (!listening) {
    return;
  }
  listening = false;
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", schedule);
  if (frame !== 0) {
    window.cancelAnimationFrame(frame);
    frame = 0;
  }
}

/**
 * Registers one per-frame task for as long as `enabled` holds.
 *
 * `task` has to be stable — wrap it in `useCallback` with an empty dependency list and
 * read state through refs, the way every caller here does. An unstable task would
 * re-register on every render, which is a subscription churn rather than a bug, but it
 * would also drop the frame it was mid-way through.
 */
export function useScrollFrame(task: FrameTask, enabled: boolean): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    tasks.add(task);
    listen();
    schedule();
    return () => {
      tasks.delete(task);
      if (tasks.size === 0) {
        stopListening();
      }
    };
  }, [task, enabled]);
}
