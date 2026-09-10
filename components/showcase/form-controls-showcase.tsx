"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ShowcaseCase, ShowcaseSection } from "./showcase-section";

const grid = "grid gap-4 md:grid-cols-2 items-start";

const roles = [
  { value: "owner", label: "소유자" },
  { value: "admin", label: "관리자" },
  { value: "editor", label: "편집자" },
  { value: "viewer", label: "뷰어" },
];

export function FormControlsShowcase() {
  return (
    <ShowcaseSection
      id="form-controls"
      title="Form Controls"
      description="36px 기본, 32px 소형 높이의 입력 요소입니다. 테두리는 17% 알파 헤어라인이고, 토스 로그인 인풋처럼 바깥 글로우 없이 1px 테두리만 호버에 연한 프라이머리, 포커스에 프라이머리 색으로 0.2초 동안 물듭니다. 스위치는 TDS처럼 켜질 때 손잡이가 커지며 스프링으로 미끄러집니다."
    >
      <ShowcaseCase label="Input" className={grid}>
        <div className="grid gap-2">
          <Label htmlFor="input-default">기본</Label>
          <Input id="input-default" placeholder="이름을 입력하세요" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="input-value">값이 있는 상태</Label>
          <Input id="input-value" defaultValue="홍길동" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="input-sm">Size: sm</Label>
          <Input id="input-sm" size="sm" placeholder="32px 높이" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="input-disabled">비활성</Label>
          <Input id="input-disabled" placeholder="수정할 수 없음" disabled />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="input-invalid">유효성 오류</Label>
          <Input
            id="input-invalid"
            defaultValue="not-an-email"
            aria-invalid
            aria-describedby="input-invalid-help"
          />
          <p
            id="input-invalid-help"
            className="text-xs font-medium text-destructive"
          >
            올바른 이메일 형식이 아닙니다.
          </p>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="input-search">아이콘 포함</Label>
          <InputGroup>
            <InputGroupAddon>
              <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
            </InputGroupAddon>
            <InputGroupInput id="input-search" placeholder="검색" />
          </InputGroup>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="input-amount">단위 표시</Label>
          <InputGroup>
            <InputGroupInput
              id="input-amount"
              inputMode="numeric"
              defaultValue="265,500"
              className="text-right tabular-nums"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupText>원</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="input-filled">채움형 검색</Label>
          <InputGroup className="border-transparent bg-secondary">
            <InputGroupAddon>
              <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
            </InputGroupAddon>
            <InputGroupInput
              id="input-filled"
              placeholder="/를 눌러 검색하세요"
            />
          </InputGroup>
        </div>
      </ShowcaseCase>

      <ShowcaseCase label="Textarea" className={grid}>
        <div className="grid gap-2">
          <Label htmlFor="textarea-default">기본</Label>
          <Textarea id="textarea-default" placeholder="메모를 입력하세요" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="textarea-disabled">비활성</Label>
          <Textarea
            id="textarea-disabled"
            defaultValue="읽기 전용 내용입니다."
            disabled
          />
        </div>
      </ShowcaseCase>

      <ShowcaseCase label="Select" className={grid}>
        <div className="grid gap-2">
          <Label htmlFor="select-default">기본</Label>
          <Select items={roles}>
            <SelectTrigger id="select-default" className="w-full">
              <SelectValue placeholder="역할 선택" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="select-value">기본값 있음</Label>
          <Select items={roles} defaultValue="admin">
            <SelectTrigger id="select-value" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="select-group">그룹</Label>
          <Select>
            <SelectTrigger id="select-group" className="w-full">
              <SelectValue placeholder="지역 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>수도권</SelectLabel>
                <SelectItem value="seoul">서울</SelectItem>
                <SelectItem value="incheon">인천</SelectItem>
                <SelectItem value="gyeonggi">경기</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>영남</SelectLabel>
                <SelectItem value="busan">부산</SelectItem>
                <SelectItem value="daegu">대구</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="select-sm">Size: sm / 비활성</Label>
          <Select items={roles} disabled>
            <SelectTrigger id="select-sm" size="sm" className="w-full">
              <SelectValue placeholder="비활성 상태" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </ShowcaseCase>

      <ShowcaseCase label="Checkbox">
        <Label>
          <Checkbox /> 기본
        </Label>
        <Label>
          <Checkbox defaultChecked /> 체크됨
        </Label>
        <Label>
          <Checkbox indeterminate /> 일부 선택
        </Label>
        <Label>
          <Checkbox disabled /> 비활성
        </Label>
        <Label>
          <Checkbox defaultChecked disabled /> 체크 + 비활성
        </Label>
        <Label>
          <Checkbox aria-invalid /> 오류
        </Label>
      </ShowcaseCase>

      <ShowcaseCase label="Radio">
        <RadioGroup defaultValue="card" className="flex w-auto gap-5">
          <Label>
            <RadioGroupItem value="card" /> 신용카드
          </Label>
          <Label>
            <RadioGroupItem value="transfer" /> 계좌이체
          </Label>
          <Label>
            <RadioGroupItem value="kakao" disabled /> 카카오페이
          </Label>
        </RadioGroup>
      </ShowcaseCase>

      <ShowcaseCase label="Switch">
        <Label>
          <Switch /> 기본
        </Label>
        <Label>
          <Switch defaultChecked /> 켜짐
        </Label>
        <Label>
          <Switch size="sm" defaultChecked /> Size: sm
        </Label>
        <Label>
          <Switch disabled /> 비활성
        </Label>
        <Label>
          <Switch defaultChecked disabled /> 켜짐 + 비활성
        </Label>
      </ShowcaseCase>
    </ShowcaseSection>
  );
}
