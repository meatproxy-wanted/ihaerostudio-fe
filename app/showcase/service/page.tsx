"use client";

import Link from "next/link";

import { ActionShowcase } from "@/components/showcase/service/action-showcase";
import { FeedbackShowcase } from "@/components/showcase/service/feedback-showcase";
import { FormShowcase } from "@/components/showcase/service/form-showcase";
import { GenerateShowcase } from "@/components/showcase/service/generate-showcase";
import { LayoutShowcase } from "@/components/showcase/service/layout-showcase";
import { OverlayShowcase } from "@/components/showcase/service/overlay-showcase";
import { StatusShowcase } from "@/components/showcase/service/status-showcase";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const sections = [
  { id: "action", label: "Button" },
  { id: "generate-button", label: "Generate" },
  { id: "form", label: "입력" },
  { id: "status", label: "상태" },
  { id: "overlay", label: "오버레이" },
  { id: "layout", label: "레이아웃" },
  { id: "feedback", label: "Toast" },
];

export default function ServiceShowcasePage() {
  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-10 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 pr-1">
            <span className="flex size-7 items-center justify-center rounded-[8px] bg-primary text-sm font-black text-primary-foreground">
              i
            </span>
            <span className="text-md font-bold tracking-tight whitespace-nowrap">
              이해로 스튜디오
            </span>
          </Link>
          <nav className="no-scrollbar hidden min-w-0 items-center gap-0.5 overflow-x-auto md:flex">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="rounded-md px-2 py-1.5 text-2sm font-semibold whitespace-nowrap text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {section.label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <Button
              size="sm"
              variant="secondary"
              nativeButton={false}
              render={<Link href="/" />}
            >
              작업함
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-1.5 px-1">
          <h1 className="text-2xl font-bold tracking-tight">
            서비스에서 쓰는 컴포넌트
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            이해로 스튜디오가 실제로 쓰는 컴포넌트만 모았습니다. 변형과 크기도
            코드에 실제로 쓰인 것만 실었고, 각 항목의 설명에 적힌 숫자는 사용처
            수입니다.
          </p>
          <p className="max-w-2xl text-2sm text-muted-foreground">
            상승·하락 같은 금융 의미는 이 서비스에 맞지 않아 뺐습니다. 쓰지 않는
            컴포넌트는 components/ui 에서 정리했습니다.
          </p>
        </div>

        <ActionShowcase />
        <GenerateShowcase />
        <FormShowcase />
        <StatusShowcase />
        <OverlayShowcase />
        <LayoutShowcase />
        <FeedbackShowcase />
      </main>

      <footer className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-xs text-muted-foreground">
        <span>이해로 스튜디오 · 사용 중인 컴포넌트</span>
        <span>components/ui 26개</span>
      </footer>
    </div>
  );
}
