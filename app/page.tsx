import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const tokens = [
  { label: "화면", className: "bg-background ring-1 ring-border" },
  { label: "패널", className: "bg-card ring-1 ring-hairline" },
  { label: "브랜드", className: "bg-primary" },
  { label: "상승", className: "bg-positive" },
  { label: "하락", className: "bg-negative" },
];

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-10 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-4xl items-center gap-3 px-4 sm:px-6">
          <span className="flex size-7 items-center justify-center rounded-[8px] bg-primary text-sm font-black text-primary-foreground">
            i
          </span>
          <span className="text-md font-bold tracking-tight">ihaerostudio</span>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href="/showcase" />}
            >
              쇼케이스
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                strokeWidth={2}
                data-icon="inline-end"
              />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <div className="flex flex-col items-start gap-3">
          <Badge>Toss Design Language</Badge>
          <h1 className="text-3xl font-bold tracking-tight">이해로스튜디오</h1>
          <p className="max-w-xl text-md text-muted-foreground">
            토스증권의 디자인 언어를 적용한 shadcn/ui(base-vega) 컴포넌트 위에서
            만듭니다. 회색 스크린 위의 패널, 헤어라인 링, 13·14px 세미볼드
            타이포, 상승·하락 색상 체계, TDS 스프링 모션이 기준입니다.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>디자인 토큰</CardTitle>
            <CardDescription>
              모든 색은 CSS 변수로 정의되어 라이트·다크 테마를 함께 따릅니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {tokens.map((token) => (
                <div key={token.label} className="flex flex-col gap-1.5">
                  <div className={`size-14 rounded-lg ${token.className}`} />
                  <span className="text-xs font-medium text-muted-foreground">
                    {token.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
