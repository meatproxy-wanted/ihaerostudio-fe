"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ComputerIcon,
  SmartPhone01Icon,
  Tablet01Icon,
} from "@hugeicons/core-free-icons";

import { ErrorState } from "@/components/app/error-state";
import { PanesSkeleton } from "@/components/app/panes-skeleton";
import { PrintDocument } from "@/components/print/print-document";
import {
  ShellActions,
  useCurrentProject,
} from "@/components/project-shell/project-context";
import { ReviewStatusBadge } from "@/components/projects/status-badges";
import { ReaderView } from "@/components/reader/reader-view";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParamsSync } from "@/hooks/use-search-params-sync";
import { useDocumentQuery, useStructureQuery } from "@/lib/api/hooks";
import { readerContextFor, toReaderContent } from "@/lib/domain/reader-content";
import { getReviewStatus } from "@/lib/domain/steps";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

type Tab = "reader" | "print";
type Device = "phone" | "tablet" | "wide";

const DEVICES: {
  key: Device;
  label: string;
  icon: typeof ComputerIcon;
  width: string;
}[] = [
  { key: "phone", label: "휴대폰", icon: SmartPhone01Icon, width: "390px" },
  { key: "tablet", label: "태블릿", icon: Tablet01Icon, width: "768px" },
  { key: "wide", label: "넓은 화면", icon: ComputerIcon, width: "100%" },
];

function parseTab(value: string | null): Tab {
  return value === "print" ? "print" : "reader";
}

function parseDevice(value: string | null): Device {
  return DEVICES.find((item) => item.key === value)?.key ?? "phone";
}

export function PreviewScreen() {
  const project = useCurrentProject();
  const searchParams = useSearchParams();
  const document = useDocumentQuery(project.id);
  const structure = useStructureQuery(project.id);
  const [tab, setTab] = useState<Tab>(() => parseTab(searchParams.get("tab")));
  const [device, setDevice] = useState<Device>(() =>
    parseDevice(searchParams.get("device")),
  );
  const [pageCount, setPageCount] = useState<number | null>(null);

  useSearchParamsSync({ tab, device });

  const content = useMemo(
    () =>
      document.data && structure.data
        ? toReaderContent(
            document.data,
            readerContextFor(project.settings, structure.data.overview),
          )
        : null,
    [document.data, structure.data, project.settings],
  );

  if (document.isPending || structure.isPending)
    return <PanesSkeleton panes={1} />;
  if (!content) {
    return (
      <ErrorState
        title="미리보기를 불러오지 못했어요"
        error={document.error ?? structure.error}
        onRetry={() => {
          void document.refetch();
          void structure.refetch();
        }}
      />
    );
  }

  const reviewed = getReviewStatus(project) === "completed";
  const frameWidth =
    DEVICES.find((item) => item.key === device)?.width ?? "390px";

  return (
    <div className="flex h-full flex-col">
      <ShellActions>
        <Button
          size="sm"
          variant="secondary"
          nativeButton={false}
          render={<Link href={routes.step(project.id, "edit")} />}
        >
          편집으로
        </Button>
        <Button
          size="sm"
          nativeButton={false}
          render={<Link href={routes.step(project.id, "export")} />}
        >
          내보내기로
        </Button>
      </ShellActions>

      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-hairline px-6 py-3">
        <h2 className="text-lg font-bold tracking-tight">결과물 미리보기</h2>
        <ReviewStatusBadge project={project} />
        <Tabs
          value={tab}
          onValueChange={(value: string) => setTab(parseTab(value))}
        >
          <TabsList aria-label="미리보기 종류">
            <TabsTrigger value="reader">읽기 화면</TabsTrigger>
            <TabsTrigger value="print">인쇄용</TabsTrigger>
          </TabsList>
        </Tabs>
        {tab === "reader" ? (
          <Tabs
            value={device}
            onValueChange={(value: string) => setDevice(parseDevice(value))}
          >
            <TabsList aria-label="기기 폭">
              {DEVICES.map((option) => (
                <TabsTrigger key={option.key} value={option.key}>
                  <HugeiconsIcon
                    icon={option.icon}
                    strokeWidth={2}
                    data-icon="inline-start"
                  />
                  {option.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        ) : (
          <p className="text-2sm text-muted-foreground" aria-live="polite">
            {pageCount === null
              ? "쪽을 나누고 있어요…"
              : `A4 · 모두 ${pageCount}쪽`}
            {!reviewed &&
              " · 검토를 마치기 전이라 모든 쪽에 초안 표시가 붙어요"}
          </p>
        )}
        <p className="ml-auto text-2sm text-muted-foreground">
          지금 편집 중인 내용이에요. 내보낸 결과물과 다를 수 있어요.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-auto bg-secondary">
        {tab === "reader" ? (
          <div className="flex h-full justify-center p-6">
            <div
              className={cn(
                "paper h-full overflow-hidden bg-background shadow-dialog ring-1 ring-hairline",
                device === "phone"
                  ? "rounded-[36px] ring-8 ring-foreground/80"
                  : "rounded-2xl",
              )}
              style={{ width: frameWidth, maxWidth: "100%" }}
            >
              <ReaderView key={device} content={content} embedded />
            </div>
          </div>
        ) : (
          <div className="py-8">
            <PrintDocument
              content={content}
              draft={!reviewed}
              zoom={0.62}
              onReady={setPageCount}
            />
          </div>
        )}
      </div>
    </div>
  );
}
