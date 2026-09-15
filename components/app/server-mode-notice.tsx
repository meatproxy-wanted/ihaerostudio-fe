"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon } from "@hugeicons/core-free-icons";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useServerMode } from "@/lib/api/hooks";

/**
 * Tells the producer when the server runs without a real model, so a copied
 * source is not mistaken for an analysis. Renders nothing otherwise.
 */
export function ServerModeNotice({ className }: { className?: string }) {
  const { demo } = useServerMode();
  if (!demo) return null;
  return (
    <Alert role="note" variant="warning" className={className}>
      <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
      <AlertTitle>서버가 데모 모드예요</AlertTitle>
      <AlertDescription>
        실제 AI 분석이 아니에요. 원문을 그대로 옮기고 &ldquo;원고:&rdquo;,
        &ldquo;법원 결정:&rdquo;처럼 표시된 줄만 분류해요. 더 쉽게 바꾸기, 용어
        후보, 용어 설명은 쓸 수 없어요.
      </AlertDescription>
    </Alert>
  );
}
