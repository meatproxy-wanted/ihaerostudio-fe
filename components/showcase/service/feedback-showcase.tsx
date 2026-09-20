"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { ShowcaseCase, ShowcaseSection } from "../showcase-section";

export function FeedbackShowcase() {
  return (
    <ShowcaseSection
      id="feedback"
      title="Toast"
      description="저장·삭제처럼 끝난 뒤에만 알리는 알림입니다. 15곳에서 쓰며, Toaster는 app/providers.tsx에 전역으로 한 번만 마운트합니다."
    >
      <ShowcaseCase
        label="Types"
        description="success · error — 눌러서 실제 알림을 띄워 보세요"
      >
        <Button
          variant="secondary"
          onClick={() =>
            toast.add({ title: "자료를 지웠어요", type: "success" })
          }
        >
          success
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            toast.add({
              title: "지우지 못했어요",
              description: "잠시 뒤 다시 시도해 주세요.",
              type: "error",
            })
          }
        >
          error (설명 포함)
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            toast.add({ title: "문장이 바뀌어서 다시 점검할게요." })
          }
        >
          기본
        </Button>
      </ShowcaseCase>
    </ShowcaseSection>
  );
}
