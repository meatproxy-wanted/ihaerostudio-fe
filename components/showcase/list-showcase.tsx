"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  FavouriteIcon,
  Notification03Icon,
  PlusSignIcon,
  SecurityCheckIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Switch } from "@/components/ui/switch";
import { Trend } from "@/components/ui/trend";
import { ShowcaseCase, ShowcaseSection } from "./showcase-section";

const watchlist = [
  {
    name: "두산퓨얼셀",
    initial: "두",
    color: "bg-[#1d3b8f]",
    price: "52,800원",
    change: 20.41,
    diff: "+8,950원",
  },
  {
    name: "스카이랩스",
    initial: "S",
    color: "bg-[#6b7684]",
    price: "24,800원",
    change: 5.53,
    diff: "+1,300원",
  },
  {
    name: "SK하이닉스",
    initial: "SK",
    color: "bg-[#e6002d]",
    price: "1,739,000원",
    change: 5.58,
    diff: "+92,000원",
  },
  {
    name: "삼양식품",
    initial: "삼",
    color: "bg-[#f05a22]",
    price: "1,307,000원",
    change: -7.76,
    diff: "-110,000원",
  },
];

const settings = [
  {
    title: "주문 체결 알림",
    description: "체결 즉시 푸시로 알려드려요",
    checked: true,
  },
  {
    title: "가격 도달 알림",
    description: "지정한 가격에 도달하면 알림",
    checked: true,
  },
  {
    title: "마케팅 정보 수신",
    description: "이벤트와 혜택 안내를 받아요",
    checked: false,
  },
];

const notifications = [
  {
    name: "김민준",
    initial: "김",
    message: "ORD-2609-1048 주문의 환불을 요청했습니다.",
    time: "5분 전",
    unread: true,
  },
  {
    name: "시스템",
    initial: "S",
    message: "9월 정산 리포트가 생성되었습니다.",
    time: "1시간 전",
    unread: true,
  },
  {
    name: "이서연",
    initial: "이",
    message: "검진 예약 일정을 9월 12일로 변경했습니다.",
    time: "어제",
    unread: false,
  },
];

export function ListShowcase() {
  return (
    <ShowcaseSection
      id="list"
      title="List"
      description="토스에서 가장 자주 등장하는 ListRow 구조입니다. Item 컴포넌트를 44~52px 행, 8px 라운드 호버로 재구성했습니다."
    >
      <ShowcaseCase
        label="Watchlist panel"
        description="로고 + 이름 / 가격 + 등락 (Trend)"
        className="grid gap-3 md:grid-cols-2"
      >
        <Card size="sm" className="gap-2 py-3">
          <CardHeader className="flex items-center gap-2 px-3">
            <Badge variant="secondary" size="lg">
              관심 주식 TOP 10
            </Badge>
            <span className="text-xs font-medium text-muted-foreground">
              관심 그룹에 담아보세요
            </span>
          </CardHeader>
          <CardContent className="px-1.5">
            <ItemGroup>
              {watchlist.map((stock) => (
                <Item
                  key={stock.name}
                  size="sm"
                  render={<button type="button" />}
                  className="text-left"
                >
                  <ItemMedia
                    variant="logo"
                    className={`${stock.color} text-white`}
                  >
                    {stock.initial}
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{stock.name}</ItemTitle>
                  </ItemContent>
                  <ItemContent>
                    <ItemTitle className="tabular-nums">
                      {stock.price}
                    </ItemTitle>
                    <Trend
                      value={stock.change}
                      size="sm"
                      className="font-semibold"
                    >
                      {stock.diff} ({Math.abs(stock.change).toFixed(2)}%)
                    </Trend>
                  </ItemContent>
                  <ItemActions>
                    <span className="flex size-6 items-center justify-center text-muted-foreground/60">
                      <HugeiconsIcon
                        icon={FavouriteIcon}
                        strokeWidth={2}
                        className="size-4"
                      />
                    </span>
                  </ItemActions>
                </Item>
              ))}
              <Item
                size="sm"
                render={<button type="button" />}
                className="text-left"
              >
                <ItemMedia
                  variant="icon"
                  className="bg-primary/15 text-primary-text"
                >
                  <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.5} />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>추가하기</ItemTitle>
                </ItemContent>
              </Item>
            </ItemGroup>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <Card size="sm" className="gap-2 py-3">
            <CardHeader className="flex items-center gap-2 px-3">
              <Badge variant="secondary" size="lg">
                알림 설정
              </Badge>
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
            <CardContent className="px-1.5">
              <ItemGroup>
                {settings.map((setting) => (
                  <Item key={setting.title} size="sm">
                    <ItemContent>
                      <ItemTitle>{setting.title}</ItemTitle>
                      <ItemDescription>{setting.description}</ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <Switch
                        size="sm"
                        defaultChecked={setting.checked}
                        aria-label={setting.title}
                      />
                    </ItemActions>
                  </Item>
                ))}
              </ItemGroup>
            </CardContent>
          </Card>
        </div>
      </ShowcaseCase>

      <ShowcaseCase
        label="Notification rows"
        description="Avatar + 본문 + 시간, 읽지 않음 표시"
        className="block"
      >
        <ItemGroup className="max-w-xl">
          {notifications.map((item) => (
            <Item
              key={item.message}
              render={<a href="#list" />}
              className="items-start"
            >
              <ItemMedia>
                <Avatar>
                  <AvatarFallback>{item.initial}</AvatarFallback>
                </Avatar>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>
                  {item.name}
                  {item.unread && (
                    <span className="size-1.5 rounded-full bg-destructive" />
                  )}
                </ItemTitle>
                <ItemDescription>{item.message}</ItemDescription>
              </ItemContent>
              <ItemActions className="self-start pt-0.5 text-xs font-medium text-muted-foreground">
                {item.time}
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      </ShowcaseCase>

      <ShowcaseCase
        label="Outline / muted rows"
        description="독립된 카드형 행"
        className="grid gap-3 md:grid-cols-2"
      >
        <Item variant="outline">
          <ItemMedia variant="icon">
            <HugeiconsIcon icon={SecurityCheckIcon} strokeWidth={2} />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>2단계 인증</ItemTitle>
            <ItemDescription>
              로그인 시 인증 앱 코드를 추가로 확인합니다.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button size="xs" variant="weak">
              설정
            </Button>
          </ItemActions>
        </Item>
        <Item variant="muted">
          <ItemMedia variant="icon">
            <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>팀 멤버 12명</ItemTitle>
            <ItemDescription>관리자 3명, 편집자 5명, 뷰어 4명</ItemDescription>
          </ItemContent>
          <ItemActions>
            <HugeiconsIcon
              icon={Notification03Icon}
              strokeWidth={2}
              className="size-4 text-muted-foreground"
            />
          </ItemActions>
        </Item>
      </ShowcaseCase>
    </ShowcaseSection>
  );
}
