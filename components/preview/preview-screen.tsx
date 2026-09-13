"use client";

import { useEffect, useMemo, useState } from "react";
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
import { useDocumentQuery, useStructureQuery } from "@/lib/api/hooks";
import { toReaderContent } from "@/lib/domain/reader-content";
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

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { key: T; label: string; icon?: typeof ComputerIcon }[];
  onChange: (value: T) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex rounded-[10px] bg-muted p-[3px] shadow-[inset_0_0_0_0.75px_var(--hairline)]"
    >
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          role="radio"
          aria-checked={value === option.key}
          onClick={() => onChange(option.key)}
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-[7px] px-3 text-2sm font-medium text-muted-foreground",
            value === option.key &&
              "bg-segment font-semibold text-foreground shadow-sm",
          )}
        >
          {option.icon && (
            <HugeiconsIcon icon={option.icon} strokeWidth={2} size={16} />
          )}
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function PreviewScreen() {
  const project = useCurrentProject();
  const searchParams = useSearchParams();
  const document = useDocumentQuery(project.id);
  const structure = useStructureQuery(project.id);
  const [tab, setTab] = useState<Tab>(
    searchParams.get("tab") === "print" ? "print" : "reader",
  );
  const [device, setDevice] = useState<Device>(
    (searchParams.get("device") as Device | null) ?? "phone",
  );
  const [pageCount, setPageCount] = useState<number | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    url.searchParams.set("device", device);
    window.history.replaceState(null, "", url);
  }, [tab, device]);

  const content = useMemo(
    () =>
      document.data && structure.data
        ? toReaderContent(document.data, {
            overview: structure.data.overview,
            tone: project.settings.tone,
            illustrations: project.settings.illustrations,
          })
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
        <Segmented
          label="미리보기 종류"
          value={tab}
          onChange={setTab}
          options={[
            { key: "reader", label: "읽기 화면" },
            { key: "print", label: "인쇄용" },
          ]}
        />
        {tab === "reader" ? (
          <Segmented
            label="기기 폭"
            value={device}
            onChange={setDevice}
            options={DEVICES}
          />
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
                "h-full overflow-hidden bg-white shadow-dialog ring-1 ring-hairline",
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
