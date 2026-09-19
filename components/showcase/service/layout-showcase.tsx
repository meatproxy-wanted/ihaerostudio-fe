"use client";

import { Kbd } from "@/components/ui/kbd";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShowcaseCase, ShowcaseSection } from "../showcase-section";

const SHORTCUTS: [keys: string, label: string][] = [
  ["↑ ↓", "이전·다음 문장"],
  ["Enter", "직접 수정"],
  ["⌘ Enter", "대조했어요 · 다음 문장"],
  ["⌘ Z", "되돌리기"],
];

export function LayoutShowcase() {
  return (
    <ShowcaseSection
      id="layout"
      title="레이아웃"
      description="원문과 초안을 나란히 놓는 3분할 편집 화면, 미리보기 종류 전환, 편집기 단축키 안내에 씁니다."
    >
      <ShowcaseCase
        label="Tabs"
        description="4곳 — 미리보기 종류, 붙여넣기 방식, 검토 목록"
      >
        <Tabs defaultValue="reader">
          <TabsList aria-label="미리보기 종류">
            <TabsTrigger value="reader">읽기 화면</TabsTrigger>
            <TabsTrigger value="print">인쇄용</TabsTrigger>
          </TabsList>
        </Tabs>
      </ShowcaseCase>

      <ShowcaseCase
        label="Resizable"
        description="3곳 — 원문 / 편집 / 도구 3분할"
        className="block"
      >
        <div className="h-40 w-full overflow-hidden rounded-xl ring-1 ring-hairline">
          <ResizablePanelGroup orientation="horizontal">
            <ResizablePanel id="demo-source" defaultSize="34" minSize="20">
              <div className="flex h-full items-center justify-center bg-background text-2sm font-semibold text-muted-foreground">
                원문 판결문
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel id="demo-draft" defaultSize="40" minSize="25">
              <div className="flex h-full items-center justify-center bg-background text-2sm font-semibold text-muted-foreground">
                쉬운 설명자료
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel id="demo-tools" defaultSize="26" minSize="18">
              <div className="flex h-full items-center justify-center bg-background text-2sm font-semibold text-muted-foreground">
                문장 도구
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </ShowcaseCase>

      <ShowcaseCase
        label="Kbd"
        description="1곳 — 편집기 단축키 안내"
        className="block"
      >
        <dl className="grid max-w-sm grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-2sm">
          {SHORTCUTS.map(([keys, label]) => (
            <div key={keys} className="contents">
              <dt>
                <Kbd>{keys}</Kbd>
              </dt>
              <dd className="text-muted-foreground">{label}</dd>
            </div>
          ))}
        </dl>
      </ShowcaseCase>
    </ShowcaseSection>
  );
}
