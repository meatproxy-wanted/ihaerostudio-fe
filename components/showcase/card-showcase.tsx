"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  MoreHorizontalIcon,
  PencilEdit02Icon,
} from "@hugeicons/core-free-icons";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trend } from "@/components/ui/trend";
import { ShowcaseCase, ShowcaseSection } from "./showcase-section";

const grid = "grid gap-3 md:grid-cols-2";

const stats = [
  { label: "오늘 결제 금액", value: "₩12,480,000", change: 8.4 },
  { label: "신규 가입", value: "128명", change: -2.1 },
  { label: "검진 예약", value: "342건", change: 0 },
];

export function CardShowcase() {
  return (
    <ShowcaseSection
      id="card"
      title="Card"
      description="토스 패널처럼 그림자 없이 헤어라인 링과 16px 라운드로 구분되는 컨테이너입니다."
    >
      <ShowcaseCase
        label="Stat cards"
        description="지표 카드 + Trend 컴포넌트"
        className="grid gap-3 md:grid-cols-3"
      >
        {stats.map((stat) => (
          <Card key={stat.label} size="sm">
            <CardHeader>
              <CardDescription className="text-2sm font-semibold">
                {stat.label}
              </CardDescription>
            </CardHeader>
            <CardContent className="gap-1">
              <p className="text-2xl font-bold tracking-tight tabular-nums">
                {stat.value}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Trend value={stat.change} showIcon />
                <span>지난주 대비</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </ShowcaseCase>

      <ShowcaseCase label="Basic" className={grid}>
        <Card>
          <CardHeader>
            <CardTitle>프로젝트 설정</CardTitle>
            <CardDescription>
              프로젝트 이름과 공개 범위를 관리합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              이 카드는 제목, 설명, 본문, 푸터를 모두 포함한 기본 구성입니다.
            </p>
          </CardContent>
          <CardFooter className="gap-2">
            <Button size="sm">저장</Button>
            <Button size="sm" variant="ghost">
              취소
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>알림 설정</CardTitle>
            <CardDescription>이메일 및 푸시 알림 수신 여부</CardDescription>
            <CardAction>
              <Button size="icon-sm" variant="ghost" aria-label="편집">
                <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              CardAction 슬롯은 헤더 오른쪽 상단에 배치됩니다.
            </p>
          </CardContent>
        </Card>
      </ShowcaseCase>

      <ShowcaseCase
        label="Panel header"
        description="토스 위젯 패널: 제목 칩 + 보조 텍스트 + 액션"
        className={grid}
      >
        <Card size="sm" className="gap-3">
          <CardHeader className="flex items-center gap-2">
            <Badge variant="secondary" size="lg">
              관심 주식 TOP 10
            </Badge>
            <span className="text-xs font-medium text-muted-foreground">
              관심 그룹에 담아보세요
            </span>
            <CardAction className="row-span-1 self-center">
              <Button size="icon-xs" variant="ghost" aria-label="더 보기">
                <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              List 섹션의 행 컴포넌트와 조합하면 토스 관심 종목 패널이 됩니다.
            </p>
          </CardContent>
        </Card>
        <Card size="sm" className="gap-3">
          <CardHeader className="flex items-center gap-2">
            <CardTitle>지금 뜨는 산업</CardTitle>
            <CardAction className="row-span-1 self-center">
              <Button
                size="xs"
                variant="ghost"
                className="text-muted-foreground"
              >
                전체 보기
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  strokeWidth={2}
                  data-icon="inline-end"
                />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              13px 세미볼드 제목과 우측 텍스트 버튼 조합의 섹션 헤더입니다.
            </p>
          </CardContent>
        </Card>
      </ShowcaseCase>

      <ShowcaseCase label="With form" className={grid}>
        <Card className="md:col-span-2 md:max-w-md">
          <CardHeader>
            <CardTitle>로그인</CardTitle>
            <CardDescription>관리자 계정으로 로그인하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Label htmlFor="card-email">이메일</Label>
              <Input
                id="card-email"
                type="email"
                placeholder="admin@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="card-password">비밀번호</Label>
              <Input id="card-password" type="password" />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button size="lg" className="w-full">
              로그인
            </Button>
            <Button variant="link" size="sm">
              비밀번호를 잊으셨나요?
            </Button>
          </CardFooter>
        </Card>
      </ShowcaseCase>

      <ShowcaseCase
        label="Bordered sections"
        description="border-b / border-t로 영역 구분"
        className={grid}
      >
        <Card className="md:col-span-2">
          <CardHeader className="border-b">
            <CardTitle>멤버 초대</CardTitle>
            <CardDescription>
              팀에 새 멤버를 초대하면 이메일로 링크가 전송됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input placeholder="member@example.com" />
              <Button variant="weak">초대</Button>
            </div>
          </CardContent>
          <CardFooter className="justify-between border-t">
            <span className="text-xs text-muted-foreground">
              남은 초대 가능 인원: 7명
            </span>
            <Button size="xs" variant="ghost">
              관리
            </Button>
          </CardFooter>
        </Card>
      </ShowcaseCase>
    </ShowcaseSection>
  );
}
