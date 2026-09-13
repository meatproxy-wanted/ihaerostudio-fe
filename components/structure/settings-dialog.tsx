"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import { Settings02Icon } from "@hugeicons/core-free-icons";

import { SettingsPicker } from "@/components/new-project/settings-picker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import { toast } from "@/components/ui/toast";
import { api } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import { cacheProject } from "@/lib/api/hooks";
import type { Settings } from "@/lib/domain/common";
import type { Project } from "@/lib/domain/project";

export function SettingsDialog({
  project,
  disabled,
  onSaved,
}: {
  project: Project;
  disabled: boolean;
  onSaved: (namingChanged: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Settings>(project.settings);
  const namingChanged = draft.naming !== project.settings.naming;

  const save = useMutation({
    mutationFn: (settings: Settings) =>
      api.projects.updateSettings(project.id, settings),
    onSuccess: (updated) => {
      cacheProject(queryClient, updated);
      setOpen(false);
      onSaved(namingChanged);
      toast.add({ title: "설정을 바꿨어요", type: "success" });
    },
    onError: (error) =>
      toast.add({
        title: "설정을 바꾸지 못했어요",
        description: errorMessage(error),
        type: "error",
      }),
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(project.settings);
        setOpen(next);
      }}
    >
      <DialogTrigger
        render={<Button variant="secondary" size="sm" disabled={disabled} />}
      >
        <HugeiconsIcon
          icon={Settings02Icon}
          strokeWidth={2}
          data-icon="inline-start"
        />
        자료 설정
      </DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>자료 설정</DialogTitle>
          <DialogDescription>
            {project.document
              ? "설정을 바꾸면 초안을 다시 만들어야 결과물에 반영돼요."
              : "고른 설정으로 초안을 만들어요."}
          </DialogDescription>
        </DialogHeader>
        <SettingsPicker value={draft} onChange={setDraft} />
        {namingChanged && (
          <Alert role="note" variant="warning">
            <AlertDescription>
              인물 호칭 방식을 바꾸면 등장인물의 호칭이 새 방식으로 바뀌어요.
              직접 고친 호칭도 새 방식으로 바뀌어요.
            </AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          <DialogClose render={<Button variant="secondary" />}>
            취소
          </DialogClose>
          <Button disabled={save.isPending} onClick={() => save.mutate(draft)}>
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
