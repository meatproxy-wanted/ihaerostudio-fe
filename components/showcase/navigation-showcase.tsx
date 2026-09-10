"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ChartLineData01Icon,
  FilterHorizontalIcon,
  GridIcon,
  Menu01Icon,
} from "@hugeicons/core-free-icons";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ShowcaseCase, ShowcaseSection } from "./showcase-section";

const panel = "text-sm text-muted-foreground";

export function NavigationShowcase() {
  return (
    <ShowcaseSection
      id="navigation"
      title="Navigation"
      description="세그먼트 컨트롤(TDS 슬라이딩 인디케이터 + 눌림 스케일), 밑줄 탭, 알약 탭과 필터 칩 등 화면을 나누는 요소들입니다."
    >
      <ShowcaseCase
        label="Tabs · segmented"
        description="기본 variant. 흰 카드가 스프링으로 미끄러지고, 누른 탭은 살짝 줄어듭니다"
        className="block"
      >
        <Tabs defaultValue="realtime">
          <TabsList>
            <TabsTrigger value="realtime">실시간</TabsTrigger>
            <TabsTrigger value="daily">일별</TabsTrigger>
            <TabsTrigger value="weekly">주별</TabsTrigger>
          </TabsList>
          <TabsContent value="realtime" className={panel}>
            실시간 체결 내역을 표시합니다.
          </TabsContent>
          <TabsContent value="daily" className={panel}>
            일별 집계를 표시합니다.
          </TabsContent>
          <TabsContent value="weekly" className={panel}>
            주별 집계를 표시합니다.
          </TabsContent>
        </Tabs>
      </ShowcaseCase>

      <ShowcaseCase
        label="Tabs · segmented lg"
        description="size=lg. 40px 높이, 14px 라운드"
        className="block"
      >
        <Tabs defaultValue="limit">
          <TabsList size="lg">
            <TabsTrigger value="limit">지정가</TabsTrigger>
            <TabsTrigger value="market">시장가</TabsTrigger>
          </TabsList>
          <TabsContent value="limit" className={panel}>
            원하는 가격을 정해 주문합니다.
          </TabsContent>
          <TabsContent value="market" className={panel}>
            현재 시장 가격으로 바로 주문합니다.
          </TabsContent>
        </Tabs>
      </ShowcaseCase>

      <ShowcaseCase
        label="Tabs · line"
        description="호버 시 알약 배경, 선택 시 2px 밑줄"
        className="block"
      >
        <Tabs defaultValue="chart">
          <TabsList variant="line">
            <TabsTrigger value="chart">실시간 차트</TabsTrigger>
            <TabsTrigger value="industry">지금 뜨는 산업</TabsTrigger>
            <TabsTrigger value="flow">외국인·기관 매매 동향</TabsTrigger>
          </TabsList>
          <TabsContent value="chart" className={panel}>
            거래대금 순위 차트가 들어갑니다.
          </TabsContent>
          <TabsContent value="industry" className={panel}>
            산업별 거래대금 순위가 들어갑니다.
          </TabsContent>
          <TabsContent value="flow" className={panel}>
            외국인·기관 순매수 동향이 들어갑니다.
          </TabsContent>
        </Tabs>
      </ShowcaseCase>

      <ShowcaseCase
        label="Tabs · pill"
        description="종목 상세 상단 탭 스타일"
        className="block"
      >
        <Tabs defaultValue="order">
          <TabsList variant="pill">
            <TabsTrigger value="order">차트 · 호가</TabsTrigger>
            <TabsTrigger value="info">종목정보</TabsTrigger>
            <TabsTrigger value="news">뉴스 · 공시</TabsTrigger>
            <TabsTrigger value="community">커뮤니티</TabsTrigger>
          </TabsList>
          <TabsContent value="order" className={panel}>
            차트와 호가창이 들어갑니다.
          </TabsContent>
          <TabsContent value="info" className={panel}>
            기업 개요와 재무 정보가 들어갑니다.
          </TabsContent>
          <TabsContent value="news" className={panel}>
            뉴스와 공시가 들어갑니다.
          </TabsContent>
          <TabsContent value="community" className={panel}>
            커뮤니티 글이 들어갑니다.
          </TabsContent>
        </Tabs>
      </ShowcaseCase>

      <ShowcaseCase
        label="Filter chips"
        description="Toggle / ToggleGroup. 선택 시 브랜드 틴트"
      >
        <Button size="xs" variant="secondary">
          <HugeiconsIcon
            icon={FilterHorizontalIcon}
            strokeWidth={2}
            data-icon="inline-start"
          />
          필터추가
        </Button>
        <ToggleGroup defaultValue={["domestic"]}>
          <ToggleGroupItem value="domestic">국내</ToggleGroupItem>
          <ToggleGroupItem value="overseas">해외</ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup multiple defaultValue={["volume", "amount"]}>
          <ToggleGroupItem value="volume">거래량</ToggleGroupItem>
          <ToggleGroupItem value="amount">거래대금</ToggleGroupItem>
          <ToggleGroupItem value="cap">시가총액</ToggleGroupItem>
          <ToggleGroupItem value="rate">주가등락률</ToggleGroupItem>
        </ToggleGroup>
        <Toggle variant="outline" aria-label="목록 보기">
          <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} />
        </Toggle>
        <Toggle variant="outline" defaultPressed aria-label="격자 보기">
          <HugeiconsIcon icon={GridIcon} strokeWidth={2} />
        </Toggle>
        <Toggle variant="ghost" size="lg">
          <HugeiconsIcon
            icon={ChartLineData01Icon}
            strokeWidth={2}
            data-icon="inline-start"
          />
          이동평균선
        </Toggle>
      </ShowcaseCase>

      <ShowcaseCase label="Breadcrumb" className="block">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">홈</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">주문 관리</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>ORD-2609-1048</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </ShowcaseCase>

      <ShowcaseCase label="Pagination" className="block">
        <Pagination className="justify-start">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" text="이전" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" text="다음" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </ShowcaseCase>
    </ShowcaseSection>
  );
}
