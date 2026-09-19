"use client";

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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ShowcaseCase, ShowcaseSection } from "../showcase-section";

export function OverlayShowcase() {
  return (
    <ShowcaseSection
      id="overlay"
      title="오버레이"
      description="되돌릴 수 없는 동작 확인, 잠긴 단계 설명, 올린 판결문 요약에 씁니다."
    >
      <ShowcaseCase
        label="AlertDialog"
        description="5곳 — 초안 다시 만들기, 검토 마치기, 자료 지우기"
      >
        <AlertDialog>
          <AlertDialogTrigger render={<Button variant="secondary" />}>
            초안 다시 만들기
          </AlertDialogTrigger>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>{"초안을\n다시 만들까요?"}</AlertDialogTitle>
              <AlertDialogDescription>
                지금까지 손본 문장 12개가 사라져요.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction variant="danger">
                다시 만들기
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </ShowcaseCase>

      <ShowcaseCase label="Dialog" description="4곳 — 자료 설정, 프롬프트 보기">
        <Dialog>
          <DialogTrigger render={<Button variant="secondary" />}>
            자료 설정
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>자료 설정</DialogTitle>
              <DialogDescription>
                문체와 인물 호칭을 바꾸면 초안을 다시 만들어야 해요.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="secondary" />}>
                닫기
              </DialogClose>
              <Button>저장</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </ShowcaseCase>

      <ShowcaseCase label="Sheet" description="1곳 — 좁은 화면의 도구 패널">
        <Sheet>
          <SheetTrigger render={<Button variant="secondary" />}>
            도구 열기
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>문장 도구</SheetTitle>
              <SheetDescription>
                더 쉽게 바꾸기 · 문장 나누기 · 용어 설명 추가 · 그림 바꾸기
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </ShowcaseCase>

      <ShowcaseCase label="Popover" description="2곳 — 올린 판결문 요약">
        <Popover>
          <PopoverTrigger render={<Button variant="ghost" />}>
            올리기 (완료)
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80">
            <div className="flex flex-col gap-1">
              <p className="text-2sm font-semibold text-muted-foreground">
                올린 판결문
              </p>
              <p className="font-semibold">붙여 넣은 텍스트</p>
              <p className="text-2sm text-muted-foreground">2,172자</p>
            </div>
          </PopoverContent>
        </Popover>
      </ShowcaseCase>

      <ShowcaseCase
        label="Tooltip"
        description="3곳 — 잠긴 단계 설명 · 키보드로도 닿아야 함"
      >
        <Tooltip>
          <TooltipTrigger render={<Button variant="ghost" />}>
            4 검토
          </TooltipTrigger>
          <TooltipContent side="bottom">
            초안을 만든 뒤에 열 수 있어요
          </TooltipContent>
        </Tooltip>
      </ShowcaseCase>

      <ShowcaseCase label="DropdownMenu" description="3곳 — 자료 카드의 더보기">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>
            더보기
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>이름 바꾸기</DropdownMenuItem>
            <DropdownMenuItem>읽기 화면 열기</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">지우기</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ShowcaseCase>
    </ShowcaseSection>
  );
}
