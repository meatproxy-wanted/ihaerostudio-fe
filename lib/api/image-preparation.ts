import type { ImagePreparationResult } from "./types";

function pause(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    signal.throwIfAborted();
    const cancel = () => {
      clearTimeout(timer);
      reject(signal.reason);
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", cancel);
      resolve();
    }, 2000);
    signal.addEventListener("abort", cancel, { once: true });
  });
}

/** Only running work is polled. Unknown submissions and failures stop visibly. */
export async function prepareEditorImages(
  advance: () => Promise<ImagePreparationResult>,
  signal: AbortSignal,
  onProgress: (result: ImagePreparationResult) => void,
): Promise<ImagePreparationResult> {
  while (true) {
    signal.throwIfAborted();
    const result = await advance();
    signal.throwIfAborted();
    onProgress(result);
    if (result.generation.status !== "running") return result;
    await pause(signal);
  }
}
