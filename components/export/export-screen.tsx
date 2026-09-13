"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Copy01Icon,
  LinkSquare02Icon,
  Pdf01Icon,
  Share08Icon,
} from "@hugeicons/core-free-icons";

import { DISCLAIMER } from "@/components/document/disclaimer";
import { useCurrentProject } from "@/components/project-shell/project-context";
import {
  PublicationBadge,
  ReviewStatusBadge,
} from "@/components/projects/status-badges";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { api } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import { cacheProject, usePublications } from "@/lib/api/hooks";
import { queryKeys } from "@/lib/api/query-keys";
import type { PublicationSummary } from "@/lib/domain/publication";
import { getPublicationStatus, getReviewStatus } from "@/lib/domain/steps";
import { routes } from "@/lib/routes";

function Panel({
  icon,
  title,
  description,
  children,
}: {
  icon: typeof Pdf01Icon;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-card p-5 ring-1 ring-hairline">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground">
          <HugeiconsIcon icon={icon} strokeWidth={1.8} size={22} />
        </span>
        <div>
          <h3 className="text-md font-bold">{title}</h3>
          <p className="text-2sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export function ExportScreen() {
  const project = useCurrentProject();
  const queryClient = useQueryClient();
  const router = useRouter();
  const publications = usePublications(project.id);
  const [confirmDraftPdf, setConfirmDraftPdf] = useState(false);

  const reviewStatus = getReviewStatus(project);
  const reviewed = reviewStatus === "completed";
  const publicationStatus = getPublicationStatus(project);
  const readUrl =
    typeof window === "undefined"
      ? routes.read(project.id)
      : `${window.location.origin}${routes.read(project.id)}`;

  const publish = useMutation({
    mutationFn: () => api.publications.publish(project.id),
    onSuccess: ({ project: updated }) => {
      cacheProject(queryClient, updated);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.publications(project.id),
      });
    },
  });
  const setPublic = useMutation({
    mutationFn: (publicationId: string | null) =>
      api.publications.setPublic(project.id, publicationId),
    onSuccess: (updated) => {
      cacheProject(queryClient, updated);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.reader(project.id),
      });
    },
  });
  const busy = publish.isPending || setPublic.isPending;

  async function savePdf() {
    // Open the tab during the click so popup blockers allow it.
    const tab = window.open("about:blank", "_blank");
    try {
      const { publication } = await publish.mutateAsync();
      const url = `${routes.print(project.id, publication.id)}&auto=1`;
      if (tab) tab.location.href = url;
      else router.push(url);
    } catch (error) {
      tab?.close();
      toast.add({
        title: "PDF를 준비하지 못했어요",
        description: errorMessage(error),
        type: "error",
      });
    }
  }

  async function publishReader(on: boolean) {
    try {
      if (!on) {
        await setPublic.mutateAsync(null);
        toast.add({ title: "읽기 화면 공개를 멈췄어요", type: "success" });
        return;
      }
      const { publication } = await publish.mutateAsync();
      await setPublic.mutateAsync(publication.id);
      toast.add({
        title: `v${publication.version}을 읽기 화면으로 공개했어요`,
        description: "주소를 복사해 독자에게 보내 주세요.",
        type: "success",
      });
    } catch (error) {
      toast.add({
        title: "공개 설정을 바꾸지 못했어요",
        description: errorMessage(error),
        type: "error",
      });
    }
  }

  const isPublic = project.publication.publicPublicationId !== null;
  const publicPublication = publications.data?.find(
    (item) => item.id === project.publication.publicPublicationId,
  );
  // Readers see the public version, which may be older than the latest PDF.
  const newerReviewedContent =
    reviewed &&
    publicPublication !== undefined &&
    publicPublication.contentRevision !== project.document?.contentRevision;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex max-w-3xl flex-col gap-5 px-6 py-8">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="mr-2 text-2xl font-bold tracking-tight">내보내기</h2>
          <ReviewStatusBadge project={project} />
          <PublicationBadge project={project} />
        </div>
        <p className="-mt-3 text-md text-muted-foreground">
          내보낼 때마다 지금 내용으로 게시본을 만들어요. 게시한 뒤에 고쳐도 이미
          내보낸 결과물은 바뀌지 않아요.
        </p>

        <Panel
          icon={Pdf01Icon}
          title="PDF로 저장"
          description="A4 인쇄용 자료를 새 탭에서 열어요. 인쇄 창에서 대상을 ‘PDF로 저장’으로 고르면 파일이 만들어져요."
        >
          {!reviewed && (
            <p className="rounded-xl bg-warning/10 px-3 py-2 text-2sm text-warning">
              아직 검토를 마치지 않았어요. 지금 저장하면 모든 쪽에 &ldquo;검토
              전 초안 · 배포하지 마세요&rdquo;가 찍혀요.
            </p>
          )}
          <Button
            className="self-start"
            disabled={busy}
            onClick={() =>
              reviewed ? void savePdf() : setConfirmDraftPdf(true)
            }
          >
            <HugeiconsIcon
              icon={Pdf01Icon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            PDF 저장
          </Button>
        </Panel>

        <Panel
          icon={Share08Icon}
          title="읽기 화면으로 공개"
          description="독자가 휴대폰에서 읽을 수 있는 주소를 만들어요. 검토를 마친 게시본만 공개할 수 있어요."
        >
          <label className="flex items-center justify-between gap-3 rounded-xl bg-background px-4 py-3 ring-1 ring-hairline">
            <span className="flex flex-col">
              <span className="text-sm font-semibold">읽기 화면 공개</span>
              <span className="text-2sm text-muted-foreground">
                {isPublic
                  ? `v${project.publication.publicVersion} 공개 중${publicPublication ? ` · ${format(new Date(publicPublication.createdAt), "M월 d일 a h:mm", { locale: ko })} 게시` : ""}`
                  : reviewed
                    ? "켜면 지금 내용으로 공개해요."
                    : "검토를 마쳐야 켤 수 있어요."}
              </span>
            </span>
            <Switch
              checked={isPublic}
              disabled={busy || (!isPublic && !reviewed)}
              onCheckedChange={(checked) => void publishReader(checked)}
            />
          </label>

          {!reviewed && !isPublic && (
            <Button
              variant="secondary"
              size="sm"
              className="self-start"
              nativeButton={false}
              render={<Link href={routes.step(project.id, "review")} />}
            >
              검토하러 가기
            </Button>
          )}

          {isPublic && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 rounded-xl bg-background px-3 py-2 ring-1 ring-hairline">
                <code className="min-w-0 flex-1 truncate text-2sm">
                  {readUrl}
                </code>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    void navigator.clipboard
                      .writeText(readUrl)
                      .then(() =>
                        toast.add({
                          title: "주소를 복사했어요",
                          type: "success",
                        }),
                      )
                      .catch(() =>
                        toast.add({
                          title: "주소를 복사하지 못했어요",
                          type: "error",
                        }),
                      );
                  }}
                >
                  <HugeiconsIcon
                    icon={Copy01Icon}
                    strokeWidth={2}
                    data-icon="inline-start"
                  />
                  주소 복사
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  nativeButton={false}
                  render={
                    <a
                      href={routes.read(project.id)}
                      target="_blank"
                      rel="noreferrer"
                    />
                  }
                >
                  <HugeiconsIcon
                    icon={LinkSquare02Icon}
                    strokeWidth={2}
                    data-icon="inline-start"
                  />
                  새 탭에서 열기
                </Button>
              </div>
              {newerReviewedContent && (
                <div className="flex items-center justify-between gap-3 rounded-xl bg-info/8 px-3 py-2 text-2sm text-info">
                  <span>
                    공개 중인 게시본보다 새로 검토를 마친 내용이 있어요.
                  </span>
                  <Button
                    size="xs"
                    disabled={busy}
                    onClick={() => void publishReader(true)}
                  >
                    새 버전으로 바꾸기
                  </Button>
                </div>
              )}
            </div>
          )}
        </Panel>

        <section className="flex flex-col gap-3 rounded-2xl bg-card p-5 ring-1 ring-hairline">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-bold">게시본 이력</h3>
            {publicationStatus === "stale" && (
              <Badge variant="warning">게시본 이후 수정됨</Badge>
            )}
          </div>
          {publications.isPending ? (
            <Skeleton className="h-16 w-full rounded-xl" />
          ) : !publications.data || publications.data.length === 0 ? (
            <p className="text-2sm text-muted-foreground">
              아직 내보낸 게시본이 없어요.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-hairline">
              {publications.data.map((item) => (
                <PublicationRow
                  key={item.id}
                  projectId={project.id}
                  publication={item}
                  isPublic={item.id === project.publication.publicPublicationId}
                />
              ))}
            </ul>
          )}
        </section>

        <section className="ring-dashed flex flex-col gap-2 rounded-2xl p-5 ring-1 ring-hairline">
          <h3 className="text-sm font-bold">
            모든 결과물에 자동으로 들어가는 안내
          </h3>
          <p className="text-2sm leading-relaxed text-muted-foreground">
            {DISCLAIMER.long[project.settings.tone]}
          </p>
          <p className="text-2sm text-muted-foreground">
            읽기 화면의 처음과 끝, PDF 표지와 모든 쪽 아래에 들어가요. 지우거나
            끌 수 없어요.
          </p>
        </section>
      </div>

      <AlertDialog open={confirmDraftPdf} onOpenChange={setConfirmDraftPdf}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {"아직 검토를\n마치지 않았어요"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {project.review.openRequiredCount
                ? `확인이 필요한 항목이 ${project.review.openRequiredCount}개 남았어요. `
                : ""}
              검토 전 초안으로 저장하면 모든 쪽에 초안 표시가 찍혀요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col">
            <AlertDialogCancel
              render={
                <Button
                  variant="secondary"
                  nativeButton={false}
                  render={<Link href={routes.step(project.id, "review")} />}
                />
              }
            >
              검토하러 가기
            </AlertDialogCancel>
            <AlertDialogAction
              variant="secondary"
              onClick={() => {
                setConfirmDraftPdf(false);
                void savePdf();
              }}
            >
              검토 전 초안으로 저장
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function PublicationRow({
  projectId,
  publication,
  isPublic,
}: {
  projectId: string;
  publication: PublicationSummary;
  isPublic: boolean;
}) {
  return (
    <li className="flex items-center gap-3 py-3">
      <span className="w-10 text-md font-bold tabular-nums">
        v{publication.version}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm">
          {format(new Date(publication.createdAt), "yyyy년 M월 d일 a h:mm", {
            locale: ko,
          })}
        </span>
        <span className="flex gap-1.5">
          <Badge variant={publication.reviewed ? "success" : "warning"}>
            {publication.reviewed ? "검토 완료" : "검토 전 초안"}
          </Badge>
          {isPublic && <Badge variant="negative">읽기 화면 공개 중</Badge>}
        </span>
      </span>
      <Button
        size="sm"
        variant="ghost"
        nativeButton={false}
        render={
          <a
            href={`${routes.print(projectId, publication.id)}&auto=1`}
            target="_blank"
            rel="noreferrer"
          />
        }
      >
        PDF 다시 저장
      </Button>
    </li>
  );
}
