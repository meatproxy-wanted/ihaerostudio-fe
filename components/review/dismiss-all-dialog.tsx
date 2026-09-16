"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { ReviewItem } from "@/lib/domain/review";

/** Confirms marking every open item in view as fine, with one shared memo. */
export function DismissAllDialog({
  open,
  onOpenChange,
  items,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: ReviewItem[];
  onConfirm: (memo: string) => void;
}) {
  const [memo, setMemo] = useState("");
  const required = items.filter((item) => item.level === "required").length;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setMemo("");
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            보이는 항목 {items.length}개를 모두 문제없음으로 확인할까요?
          </DialogTitle>
          <DialogDescription>
            잘못 확인한 항목은 나중에 하나씩 되돌릴 수 있어요.
          </DialogDescription>
        </DialogHeader>

        {required > 0 && (
          <p className="flex items-start gap-2 rounded-xl bg-warning/10 p-3 text-2sm text-warning">
            <HugeiconsIcon
              icon={Alert02Icon}
              strokeWidth={2}
              size={16}
              className="mt-0.5 shrink-0"
            />
            확인 필요 항목 {required}개가 들어 있어요. 원문과 대조하지 않고
            넘기면 뜻이 달라진 부분을 놓칠 수 있어요.
          </p>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-2sm font-semibold" htmlFor="dismiss-all-memo">
            왜 문제가 없나요? (선택)
          </label>
          <Textarea
            id="dismiss-all-memo"
            value={memo}
            placeholder="예: 원문 전체를 한 번 더 읽고 대조했어요."
            onChange={(event) => setMemo(event.target.value)}
          />
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="secondary" />}>
            취소
          </DialogClose>
          <Button
            onClick={() => {
              onConfirm(memo);
              onOpenChange(false);
            }}
          >
            모두 문제없음으로 확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
