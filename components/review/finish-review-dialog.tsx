"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  CheckmarkBadge01Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { api } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import { cacheProject } from "@/lib/api/hooks";
import type { EasyDocument } from "@/lib/domain/document";
import { verificationProgress } from "@/lib/domain/document-ops";
import type { Project } from "@/lib/domain/project";
import {
  CHECKLIST_LABELS,
  checklistFor,
  type ChecklistKey,
  countByStatus,
  reviewItemStatus,
  type ReviewRun,
} from "@/lib/domain/review";
import { cn } from "@/lib/utils";

export function FinishReviewDialog({
  project,
  document,
  run,
  onRecheck,
  checking,
}: {
  project: Project;
  document: EasyDocument;
  run: ReviewRun | null;
  onRecheck: () => void;
  checking: boolean;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState<ChecklistKey[]>([]);
  const checklist = checklistFor(project.settings.illustrations);

  const complete = useMutation({
    mutationFn: () => api.review.complete(project.id, { checklist: checked }),
    onSuccess: ({ project: updated }) => {
      cacheProject(queryClient, updated);
      setOpen(false);
      toast.add({
        title: "검토를 마쳤어요",
        description: "이제 내보내기에서 읽기 화면으로 공개할 수 있어요.",
        type: "success",
      });
    },
    onError: (error) =>
      toast.add({
        title: "검토를 마치지 못했어요",
        description: errorMessage(error),
        type: "error",
      }),
  });

  const stale = !run || run.contentRevision !== document.contentRevision;
  const runItems = run?.items ?? [];
  const requiredOpen = runItems.filter(
    (item) => reviewItemStatus(item) === "required",
  );
  const suggestedOpen = countByStatus(runItems).suggested;
  const { verified, total } = verificationProgress(document);
  const allChecked = checklist.every((key) => checked.includes(key));
  const canComplete = !stale && requiredOpen.length === 0 && allChecked;
  // Once the request is out, keep the dialog put so the result lands where the maker is looking.
  const saving = complete.isPending;

  return (
    <Dialog
      open={open}
      disablePointerDismissal={saving}
      onOpenChange={(next) => {
        if (!next && saving) return;
        if (next) setChecked([]);
        setOpen(next);
      }}
    >
      <DialogTrigger render={<Button size="sm" />}>
        <HugeiconsIcon
          icon={CheckmarkBadge01Icon}
          strokeWidth={2}
          data-icon="inline-start"
        />
        검토 마치기
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>검토를 마칠까요?</DialogTitle>
          <DialogDescription>
            검토 완료는 지금 내용에 대한 확인이에요. 마친 뒤에 내용을 고치면
            다시 검토해야 해요.
          </DialogDescription>
        </DialogHeader>

        {stale ? (
          <div className="flex flex-col items-start gap-2 rounded-xl bg-warning/10 p-3 text-2sm text-warning">
            <p className="flex items-start gap-2">
              <HugeiconsIcon
                icon={Alert02Icon}
                strokeWidth={2}
                size={16}
                className="mt-0.5"
              />
              점검한 뒤에 문서가 바뀌었어요. 다시 점검한 뒤에 마칠 수 있어요.
            </p>
            <Button
              size="xs"
              variant="secondary"
              disabled={checking || saving}
              onClick={onRecheck}
            >
              다시 점검
            </Button>
          </div>
        ) : requiredOpen.length > 0 ? (
          <div className="flex flex-col gap-1.5 rounded-xl bg-warning/10 p-3 text-2sm text-warning">
            <p className="flex items-start gap-2 font-semibold">
              <HugeiconsIcon
                icon={Alert02Icon}
                strokeWidth={2}
                size={16}
                className="mt-0.5"
              />
              확인이 필요한 항목이 {requiredOpen.length}개 남았어요.
            </p>
            <ul className="list-disc pl-8 text-foreground">
              {requiredOpen.slice(0, 3).map((item) => (
                <li key={item.key}>{item.title}</li>
              ))}
            </ul>
            <p>고치거나 문제없음으로 확인해야 마칠 수 있어요.</p>
          </div>
        ) : null}

        <div className="flex items-start gap-2 rounded-xl bg-secondary p-3 text-2sm">
          <HugeiconsIcon
            icon={InformationCircleIcon}
            strokeWidth={2}
            size={16}
            className="mt-0.5 shrink-0 text-info"
          />
          <p>
            살펴보기 항목 {suggestedOpen}개, 원문과 대조하지 않은 문장{" "}
            {total - verified}개가 남아 있어요. 이 둘은 검토 완료를 막지 않아요.
          </p>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-bold">
            최종 확인 체크리스트
          </legend>
          {checklist.map((key) => (
            <label
              key={key}
              className={cn(
                "flex items-start gap-3 rounded-xl p-3 ring-1 ring-hairline",
                checked.includes(key) && "bg-success/5 ring-success/30",
              )}
            >
              <Checkbox
                checked={checked.includes(key)}
                disabled={saving}
                onCheckedChange={(value) =>
                  setChecked((current) =>
                    value
                      ? [...current, key]
                      : current.filter((item) => item !== key),
                  )
                }
                className="mt-0.5"
              />
              <span className="text-sm font-medium">
                {CHECKLIST_LABELS[key]}
              </span>
            </label>
          ))}
        </fieldset>

        <DialogFooter>
          <DialogClose
            render={<Button variant="secondary" disabled={saving} />}
          >
            더 볼게요
          </DialogClose>
          <Button
            disabled={!canComplete || saving}
            onClick={() => complete.mutate()}
          >
            {saving && <Spinner data-icon="inline-start" />}
            검토 완료로 표시
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
