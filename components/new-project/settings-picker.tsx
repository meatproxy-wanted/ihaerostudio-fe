"use client";

import type { ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Image01Icon } from "@hugeicons/core-free-icons";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

/**
 * A line of the card being described. The fill fades along its length so a
 * row of them reads as text trailing off rather than as three grey bars.
 */
function PreviewLine({ className }: { className: string }) {
  return (
    <span
      className={cn(
        "h-1.5 rounded-full bg-gradient-to-r from-foreground/30 to-foreground/10",
        className,
      )}
    />
  );
}

/**
 * What one card of the finished material looks like. Both variants stand
 * 40px tall — the height the thumbnail sets — and carry the same three
 * lines, so the only difference between the two choices is the thing the
 * choice is about: whether a picture sits beside the text.
 */
function CardPreview({ withPicture }: { withPicture: boolean }) {
  return (
    <span className="flex min-h-10 items-center gap-2.5" aria-hidden="true">
      {withPicture && (
        /*
          A picture frame, not a shape: at 40px a bare circle read as a
          bullet or an avatar, and this square has to say "그림" on its own.
          The glyph is the one everything else uses for an image.
        */
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-info/25 to-info/5 text-info/55">
          <HugeiconsIcon icon={Image01Icon} strokeWidth={1.5} size={19} />
        </span>
      )}
      <span className="flex flex-1 flex-col gap-1.5">
        <PreviewLine className="w-11/12" />
        <PreviewLine className="w-full" />
        <PreviewLine className="w-7/12" />
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
      <RadioGroup
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
            /*
              The hover ring is for cards the producer has not picked. On the
              chosen one it fought the primary ring and won, so the selection
              changed colour under the pointer as if it were coming undone.
            */
            className="flex cursor-pointer flex-col gap-3 rounded-xl bg-card p-3.5 ring-1 ring-hairline transition-shadow not-has-data-checked:hover:ring-border has-focus-visible:ring-3 has-focus-visible:ring-ring/40 has-data-checked:ring-2 has-data-checked:ring-primary"
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
            <span className="paper block rounded-lg px-3 py-2.5 text-2sm leading-relaxed break-keep ring-1 ring-hairline">
              {choice.preview}
            </span>
          </label>
        ))}
      </RadioGroup>
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
