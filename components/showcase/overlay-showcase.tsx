"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Copy01Icon,
  Delete02Icon,
  Edit02Icon,
  InformationCircleIcon,
  Logout01Icon,
  Settings01Icon,
  Share01Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FloatingToolbar,
  FloatingToolbarButton,
  FloatingToolbarLabel,
  FloatingToolbarSeparator,
} from "@/components/ui/floating-toolbar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ShowcaseCase, ShowcaseSection } from "./showcase-section";

export function OverlayShowcase() {
  const [interval, setInterval] = React.useState("1m");
  const [showVolume, setShowVolume] = React.useState(true);
  const [showMa, setShowMa] = React.useState(false);
  const [toolbarOpen, setToolbarOpen] = React.useState(false);

  return (
    <ShowcaseSection
      id="overlay"
      title="Overlay"
      description="메뉴와 팝오버는 흰 표면 + 12px 라운드 + 이중 그림자. 다이얼로그는 TDS처럼 24px 라운드, 20% 딤, 스프링 슬라이드 업으로 열리고 닫히지 않는 딤을 누르면 흔들립니다."
    >
      <ShowcaseCase label="Dropdown menu">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="secondary" size="sm" />}
          >
            <HugeiconsIcon
              icon={Settings01Icon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            차트 설정
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>표시</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={showVolume}
                onCheckedChange={setShowVolume}
              >
                거래량
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={showMa}
                onCheckedChange={setShowMa}
              >
                이동평균선
              </DropdownMenuCheckboxItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>봉 간격</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={interval}
                onValueChange={setInterval}
              >
                <DropdownMenuRadioItem value="1m">1분</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="5m">5분</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="1d">일</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
            <HugeiconsIcon
              icon={UserCircleIcon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            계정
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} />
                프로필 편집
                <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HugeiconsIcon icon={Share01Icon} strokeWidth={2} />
                공유하기
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} />
                링크 복사
                <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive">
                <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ShowcaseCase>

      <ShowcaseCase label="Popover · Tooltip">
        <Popover>
          <PopoverTrigger render={<Button variant="weak" size="sm" />}>
            정산 안내
          </PopoverTrigger>
          <PopoverContent align="start">
            <PopoverHeader>
              <PopoverTitle>정산 주기</PopoverTitle>
              <PopoverDescription>
                매월 1일과 16일에 직전 기간의 결제 금액을 정산합니다.
              </PopoverDescription>
            </PopoverHeader>
            <div className="flex items-center justify-between rounded-md bg-secondary px-3 py-2 text-2sm font-medium">
              <span className="text-muted-foreground">다음 정산일</span>
              <span className="tabular-nums">9월 16일</span>
            </div>
          </PopoverContent>
        </Popover>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label="도움말" />
              }
            >
              <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} />
            </TooltipTrigger>
            <TooltipContent>결제 완료 주문의 합계입니다</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </ShowcaseCase>

      <ShowcaseCase label="Dialog · Alert dialog · Sheet">
        <Dialog>
          <DialogTrigger render={<Button size="sm" />}>메모 작성</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>메모 작성</DialogTitle>
              <DialogDescription>
                이 주문에 대한 내부 메모를 남깁니다. 고객에게는 보이지 않습니다.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <Label htmlFor="dialog-memo">메모</Label>
              <Input id="dialog-memo" placeholder="예: 검진 일정 재확인 필요" />
            </div>
            <div className="flex items-center justify-between rounded-md bg-secondary px-3 py-2">
              <span className="text-2sm font-medium">
                담당자에게 알림 보내기
              </span>
              <Switch
                size="sm"
                defaultChecked
                aria-label="담당자에게 알림 보내기"
              />
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="secondary" />}>
                취소
              </DialogClose>
              <Button>저장</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog>
          <AlertDialogTrigger
            render={<Button variant="destructive" size="sm" />}
          >
            <HugeiconsIcon
              icon={Delete02Icon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            주문 삭제
          </AlertDialogTrigger>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>{"주문을\n삭제할까요?"}</AlertDialogTitle>
              <AlertDialogDescription>
                {"삭제한 주문은 복구할 수 없어요.\n정산 내역에서도 제외됩니다."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction variant="danger">삭제</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog disablePointerDismissal>
          <DialogTrigger render={<Button variant="secondary" size="sm" />}>
            딤 누르면 위글
          </DialogTrigger>
          <DialogContent showCloseButton={false} className="sm:max-w-xs">
            <DialogHeader>
              <DialogTitle>{"정산 요청이\n접수되었어요"}</DialogTitle>
              <DialogDescription>
                {
                  "영업일 기준 3일 안에 입금돼요.\n딤을 눌러도 닫히지 않고 흔들려요."
                }
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button />}>확인</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Sheet>
          <SheetTrigger render={<Button variant="outline" size="sm" />}>
            주문 상세
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>ORD-2609-1048</SheetTitle>
              <SheetDescription>2026년 9월 4일 · 신용카드</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-3 px-5">
              {[
                ["고객", "김민준"],
                ["상품", "스마트 건강검진 패키지"],
                ["결제 금액", "₩249,000"],
                ["상태", "결제 완료"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="font-medium text-muted-foreground">
                    {label}
                  </span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
            </div>
            <SheetFooter>
              <Button>영수증 다운로드</Button>
              <Button variant="secondary">환불 처리</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </ShowcaseCase>

      <ShowcaseCase
        label="Floating toolbar"
        description="선택 작업용 알약 툴바. 화면 위·아래에 떠서 스프링으로 등장하고 Esc로 닫힙니다"
      >
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setToolbarOpen((open) => !open)}
        >
          {toolbarOpen ? "툴바 숨기기" : "툴바 보기"}
        </Button>
        <FloatingToolbar
          open={toolbarOpen}
          side="top"
          onDismiss={() => setToolbarOpen(false)}
          aria-label="선택한 아이콘 작업"
        >
          <FloatingToolbarLabel>
            <Badge variant="solid" className="rounded-full px-1.5 tabular-nums">
              2
            </Badge>
            선택됨
          </FloatingToolbarLabel>
          <FloatingToolbarSeparator />
          <FloatingToolbarButton>
            <HugeiconsIcon
              icon={Copy01Icon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            복제
          </FloatingToolbarButton>
          <FloatingToolbarButton>
            <HugeiconsIcon
              icon={Share01Icon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            공유
          </FloatingToolbarButton>
          <FloatingToolbarButton variant="destructive">
            <HugeiconsIcon
              icon={Delete02Icon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            삭제
          </FloatingToolbarButton>
        </FloatingToolbar>
      </ShowcaseCase>
    </ShowcaseSection>
  );
}
