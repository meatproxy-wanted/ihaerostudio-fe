"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, Search01Icon } from "@hugeicons/core-free-icons";

import { AlertShowcase } from "@/components/showcase/alert-showcase";
import { BadgeShowcase } from "@/components/showcase/badge-showcase";
import { ButtonShowcase } from "@/components/showcase/button-showcase";
import { CardShowcase } from "@/components/showcase/card-showcase";
import { DataTableShowcase } from "@/components/showcase/data-table-showcase";
import { FeedbackShowcase } from "@/components/showcase/feedback-showcase";
import { FormControlsShowcase } from "@/components/showcase/form-controls-showcase";
import { ListShowcase } from "@/components/showcase/list-showcase";
import { NavigationShowcase } from "@/components/showcase/navigation-showcase";
import { OverlayShowcase } from "@/components/showcase/overlay-showcase";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";

const sections = [
  { id: "button", label: "Button" },
  { id: "badge", label: "Badge" },
  { id: "alert", label: "Alert" },
  { id: "card", label: "Card" },
  { id: "form-controls", label: "Form" },
  { id: "navigation", label: "Navigation" },
  { id: "list", label: "List" },
  { id: "overlay", label: "Overlay" },
  { id: "feedback", label: "Feedback" },
  { id: "data-table", label: "Data Table" },
];

export default function ShowcasePage() {
  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-10 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <a href="#" className="flex items-center gap-2 pr-1">
            <span className="flex size-7 items-center justify-center rounded-[8px] bg-primary text-sm font-black text-primary-foreground">
              b
            </span>
            <span className="text-md font-bold tracking-tight whitespace-nowrap">
              bandirang
            </span>
          </a>
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
            <InputGroup className="hidden w-44 border-transparent bg-secondary lg:flex">
              <InputGroupAddon>
                <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
              </InputGroupAddon>
              <InputGroupInput
                aria-label="컴포넌트 검색"
                placeholder="컴포넌트 검색"
              />
              <InputGroupAddon align="inline-end">
                <Kbd>/</Kbd>
              </InputGroupAddon>
            </InputGroup>
            <ThemeToggle />
            <Button size="sm">
              <HugeiconsIcon
                icon={PlusSignIcon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              새 주문
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-1.5 px-1">
          <h1 className="text-2xl font-bold tracking-tight">
            컴포넌트 쇼케이스
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            토스증권의 디자인 언어를 적용한 shadcn/ui 컴포넌트 모음입니다. 회색
            스크린 위의 패널, 헤어라인 링, 13·14px 세미볼드 타이포, 노란 브랜드
            컬러와 상승·하락 색상 체계, TDS 스프링 모션을 기준으로 합니다.
          </p>
        </div>

        <ButtonShowcase />
        <BadgeShowcase />
        <AlertShowcase />
        <CardShowcase />
        <FormControlsShowcase />
        <NavigationShowcase />
        <ListShowcase />
        <OverlayShowcase />
        <FeedbackShowcase />
        <DataTableShowcase />
      </main>

      <footer className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-xs text-muted-foreground">
        <span>bandirang · UI Showcase</span>
        <span>shadcn/ui base-vega · Pretendard</span>
      </footer>
    </div>
  );
}
