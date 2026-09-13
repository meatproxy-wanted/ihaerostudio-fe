"use client";

import { useQuery } from "@tanstack/react-query";

import { ErrorState } from "@/components/app/error-state";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";

import { ReaderView } from "./reader-view";

export function PublicReader({ projectId }: { projectId: string }) {
  const reading = useQuery({
    queryKey: queryKeys.reader(projectId),
    queryFn: () => api.reader.get(projectId),
  });

  if (reading.isPending) {
    return (
      <div
        className="flex min-h-svh items-center justify-center"
        aria-busy="true"
      >
        <Spinner className="size-8" />
      </div>
    );
  }
  if (reading.isError) {
    return (
      <ErrorState
        className="min-h-svh text-[18px]"
        title="자료를 불러오지 못했어요"
        error={reading.error}
        onRetry={() => reading.refetch()}
      />
    );
  }
  if (reading.data.status === "unavailable") {
    return (
      <Empty className="min-h-svh text-[20px]">
        <EmptyHeader className="max-w-md gap-3">
          <EmptyTitle className="text-[1.3em]">
            지금은 볼 수 없는 자료예요
          </EmptyTitle>
          <EmptyDescription className="text-[0.9em] leading-relaxed">
            아직 공개하지 않았거나 공개를 멈춘 자료예요. 자료를 보내 준 곳에
            물어봐 주세요.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }
  return <ReaderView content={reading.data.publication.content} />;
}
