"use client";

import { useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ShowcaseCase, ShowcaseSection } from "../showcase-section";

export function FormShowcase() {
  const [tone, setTone] = useState("haeyo");
  const [checked, setChecked] = useState(true);
  const [category, setCategory] = useState<string[]>(["number"]);

  return (
    <ShowcaseSection
      id="form"
      title="입력"
      description="판결문을 붙여 넣고, 결과물 설정을 고르고, 사건 구조 항목을 고치는 데 쓰는 입력들입니다."
    >
      <ShowcaseCase
        label="Textarea"
        description="8곳 — 판결문 붙여넣기, 문장 직접 수정"
        className="block"
      >
        <Textarea
          className="w-full"
          rows={3}
          defaultValue="원고는 피고에게 임대차보증금 1억 원을 지급하라."
          aria-label="문장 고치기"
        />
      </ShowcaseCase>

      <ShowcaseCase
        label="Input"
        description="2곳 — 자료 제목, 용어 이름"
        className="block"
      >
        <Input
          className="max-w-sm"
          defaultValue="임대차보증금 반환 쉬운 설명자료"
          aria-label="자료 제목"
        />
      </ShowcaseCase>

      <ShowcaseCase label="Checkbox" description="3곳 — 확인 체크리스트">
        <label className="flex items-start gap-3">
          <Checkbox
            checked={checked}
            onCheckedChange={(value) => setChecked(value === true)}
            className="mt-0.5"
          />
          <span className="flex flex-col">
            <span className="text-sm font-semibold">
              원문과 비교해 확인했어요
            </span>
            <span className="text-2sm text-muted-foreground">
              주장과 법원의 판단이 섞이지 않았는지 봐 주세요.
            </span>
          </span>
        </label>
      </ShowcaseCase>

      <ShowcaseCase
        label="RadioGroup"
        description="1곳 — 결과물 설정(문체·호칭·그림)"
        className="block"
      >
        <RadioGroup value={tone} onValueChange={setTone}>
          <label className="flex items-center gap-3 text-sm">
            <RadioGroupItem value="haeyo" />
            해요체 — 부드러운 존댓말
          </label>
          <label className="flex items-center gap-3 text-sm">
            <RadioGroupItem value="hamnida" />
            합니다체 — 격식 있는 존댓말
          </label>
        </RadioGroup>
      </ShowcaseCase>

      <ShowcaseCase label="NativeSelect" description="1곳 — 사실 분류 바꾸기">
        <NativeSelect defaultValue="background" aria-label="사실 분류">
          <NativeSelectOption value="background">배경</NativeSelectOption>
          <NativeSelectOption value="dispute">다툼</NativeSelectOption>
          <NativeSelectOption value="evidence">증거</NativeSelectOption>
        </NativeSelect>
      </ShowcaseCase>

      <ShowcaseCase
        label="ToggleGroup"
        description="1곳 — 검토 화면에서 분류로 거르기"
      >
        <ToggleGroup
          aria-label="분류로 거르기"
          size="sm"
          value={category}
          onValueChange={setCategory}
        >
          <ToggleGroupItem value="number">숫자·날짜 8</ToggleGroupItem>
          <ToggleGroupItem value="long">긴 문장 1</ToggleGroupItem>
          <ToggleGroupItem value="term">어려운 말 3</ToggleGroupItem>
        </ToggleGroup>
      </ShowcaseCase>

      <ShowcaseCase label="Switch" description="1곳 — 원문 대조 표시 켜고 끄기">
        <label className="flex items-center gap-3 text-sm font-medium">
          <Switch defaultChecked />
          확인 필요 표시만 보기
        </label>
      </ShowcaseCase>
    </ShowcaseSection>
  );
}
