"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Empty className="min-h-svh bg-background">
      <EmptyHeader>
        <EmptyTitle className="text-lg">문제가 생겼어요</EmptyTitle>
        <EmptyDescription>
          화면을 그리는 중에 예상하지 못한 문제가 생겼어요. 편집 내용은 자동으로
          저장돼 있어요.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center">
        <Button onClick={() => retry()}>다시 시도</Button>
        <Button
          variant="secondary"
          nativeButton={false}
          render={<Link href="/" />}
        >
          작업함으로
        </Button>
      </EmptyContent>
    </Empty>
  );
}
