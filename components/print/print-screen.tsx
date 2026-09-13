"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import { PrinterIcon } from "@hugeicons/core-free-icons";

import { ErrorState } from "@/components/app/error-state";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";

import { PrintDocument } from "./print-document";

export function PrintScreen({ projectId }: { projectId: string }) {
  const searchParams = useSearchParams();
  const publicationId = searchParams.get("publication") ?? "";
  const autoPrint = searchParams.get("auto") === "1";
  const [pageCount, setPageCount] = useState<number | null>(null);
  const printed = useRef(false);

  const publication = useQuery({
    queryKey: queryKeys.publication(projectId, publicationId),
    queryFn: () => api.publications.get(projectId, publicationId),
    enabled: publicationId !== "",
  });

  useEffect(() => {
    if (!autoPrint || pageCount === null || printed.current) return;
    printed.current = true;
    const timer = setTimeout(() => window.print(), 300);
    return () => clearTimeout(timer);
  }, [autoPrint, pageCount]);

  if (publicationId === "" || publication.isError) {
    return (
      <ErrorState
        className="min-h-svh"
        title="인쇄할 게시본을 찾지 못했어요"
        error={publication.error}
      />
    );
  }
  if (publication.isPending) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 bg-secondary py-8 print:bg-white print:py-0">
      <style>
        {
          "@page { size: A4; margin: 0; } @media print { body { background: #fff; } .print-page { break-after: page; } }"
        }
      </style>
      <div className="flex w-[210mm] max-w-full items-center justify-between gap-3 rounded-2xl bg-background px-4 py-3 ring-1 ring-hairline print:hidden">
        <div className="text-2sm">
          <p className="font-semibold">
            v{publication.data.version} ·{" "}
            {publication.data.reviewed ? "검토 완료" : "검토 전 초안"}
            {pageCount !== null && ` · 모두 ${pageCount}쪽`}
          </p>
          <p className="text-muted-foreground">
            인쇄 창에서 대상을 &lsquo;PDF로 저장&rsquo;으로 고르면 PDF 파일이
            만들어져요.
          </p>
        </div>
        <Button disabled={pageCount === null} onClick={() => window.print()}>
          <HugeiconsIcon
            icon={PrinterIcon}
            strokeWidth={2}
            data-icon="inline-start"
          />
          인쇄 · PDF로 저장
        </Button>
      </div>
      <PrintDocument
        content={publication.data.content}
        draft={!publication.data.reviewed}
        onReady={setPageCount}
      />
    </div>
  );
}
