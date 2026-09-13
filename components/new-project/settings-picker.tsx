"use client";

import type { ReactNode } from "react";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";

import { RadioGroupItem } from "@/components/ui/radio-group";
import type {
  Illustrations,
  Naming,
  Settings,
  Tone,
} from "@/lib/domain/common";
import { cn } from "@/lib/utils";

interface Choice<T extends string> {
  value: T;
  label: string;
  hint: string;
  preview: ReactNode;
}

const TONE_CHOICES: Choice<Tone>[] = [
  {
    value: "haeyo",
    label: "해요체",
    hint: "부드러운 존댓말",
    preview: "법원은 B씨가 보증금을 돌려줘야 한다고 판단했어요.",
  },
  {
    value: "hamnida",
    label: "합니다체",
    hint: "격식 있는 존댓말",
    preview: "법원은 B씨가 보증금을 돌려주어야 한다고 판단했습니다.",
  },
];

const NAMING_CHOICES: Choice<Naming>[] = [
  {
    value: "initial",
    label: "A씨·B씨",
    hint: "판결문의 익명 표기를 따라요",
    preview: "A씨는 B씨에게 보증금을 달라고 했어요.",
  },
  {
    value: "role",
    label: "하는 일로 부르기",
    hint: "세입자, 집주인처럼",
    preview: "세입자는 집주인에게 보증금을 달라고 했어요.",
  },
  {
    value: "legal",
    label: "원고·피고와 설명",
    hint: "법률 용어를 함께 익혀요",
    preview: "원고(재판을 건 사람)는 피고에게 보증금을 달라고 했어요.",
  },
];

const ILLUSTRATION_CHOICES: Choice<Illustrations>[] = [
  {
    value: "with",
    label: "글과 그림 함께",
    hint: "카드마다 그림을 붙여요",
    preview: <CardPreview withPicture />,
  },
  {
    value: "none",
    label: "글만",
    hint: "그림 없이 글로만 만들어요",
    preview: <CardPreview withPicture={false} />,
  },
];

function CardPreview({ withPicture }: { withPicture: boolean }) {
  return (
    <span className="flex items-center gap-2.5" aria-hidden="true">
      {withPicture && (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-info/10">
          <span className="size-4 rounded-full border-2 border-foreground/70" />
        </span>
      )}
      <span className="flex flex-1 flex-col gap-1.5">
        <span className="h-1.5 w-11/12 rounded-full bg-foreground/25" />
        <span className="h-1.5 w-8/12 rounded-full bg-foreground/25" />
      </span>
    </span>
  );
}

function ChoiceGroup<T extends string>({
  legend,
  description,
  choices,
  value,
  onChange,
  columns,
}: {
  legend: string;
  description: string;
  choices: Choice<T>[];
  value: T;
  onChange: (value: T) => void;
  columns: 2 | 3;
}) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="contents">
        <span className="text-md font-semibold">{legend}</span>
      </legend>
      <p className="-mt-2 text-2sm text-muted-foreground">{description}</p>
      <RadioGroupPrimitive
        value={value}
        onValueChange={(next) => onChange(next as T)}
        className={cn(
          "grid gap-2.5",
          columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3",
        )}
      >
        {choices.map((choice) => (
          <label
            key={choice.value}
            className="flex cursor-pointer flex-col gap-3 rounded-xl bg-card p-3.5 ring-1 ring-hairline transition-shadow hover:ring-border has-data-checked:ring-2 has-data-checked:ring-primary has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/40"
          >
            <span className="flex items-start gap-2.5">
              <RadioGroupItem value={choice.value} className="mt-0.5" />
              <span className="flex flex-col">
                <span className="text-sm font-semibold">{choice.label}</span>
                <span className="text-2sm text-muted-foreground">
                  {choice.hint}
                </span>
              </span>
            </span>
            <span className="paper block rounded-lg px-3 py-2.5 text-2sm leading-relaxed [word-break:keep-all] ring-1 ring-hairline">
              {choice.preview}
            </span>
          </label>
        ))}
      </RadioGroupPrimitive>
    </fieldset>
  );
}

export function SettingsPicker({
  value,
  onChange,
}: {
  value: Settings;
  onChange: (value: Settings) => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      <ChoiceGroup
        legend="문체"
        description="두 가지 모두 성인을 존중하는 존댓말이에요."
        choices={TONE_CHOICES}
        value={value.tone}
        onChange={(tone) => onChange({ ...value, tone })}
        columns={2}
      />
      <ChoiceGroup
        legend="인물 호칭"
        description="등장인물마다 나중에 따로 바꿀 수 있어요."
        choices={NAMING_CHOICES}
        value={value.naming}
        onChange={(naming) => onChange({ ...value, naming })}
        columns={3}
      />
      <ChoiceGroup
        legend="그림"
        description="그림은 글의 뜻을 돕는 데만 써요."
        choices={ILLUSTRATION_CHOICES}
        value={value.illustrations}
        onChange={(illustrations) => onChange({ ...value, illustrations })}
        columns={2}
      />
    </div>
  );
}
