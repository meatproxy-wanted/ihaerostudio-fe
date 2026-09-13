"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { PencilEdit02Icon } from "@hugeicons/core-free-icons";

import { CardLabel } from "@/components/document/card-label";
import { DiffView, NumberWarning } from "@/components/editor/diff-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { EasyDocument } from "@/lib/domain/document";
import { findCard, findSentence } from "@/lib/domain/document-ops";
import {
  REVIEW_CATEGORY_LABELS,
  REVIEW_STATUS_LABELS,
  type ReviewItem,
} from "@/lib/domain/review";
import type { SourceDocument } from "@/lib/domain/source";
import { routes } from "@/lib/routes";

import { editorLinkFor } from "./review-model";
import { REVIEW_STATUS_STYLES } from "./review-status";

function Block({
  title,
  children,
  paper = false,
}: {
  title: string;
  children: React.ReactNode;
  paper?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <p className="text-[11px] font-semibold text-muted-foreground">{title}</p>
      <div
        className={
          paper
            ? "paper rounded-xl p-3 ring-1 ring-hairline"
            : "rounded-xl bg-card p-3 ring-1 ring-hairline"
        }
      >
        {children}
      </div>
    </div>
  );
}

export function ReviewDetail({
  projectId,
  item,
  document,
  source,
  busy,
  onApplySuggestion,
  onDismiss,
  onRestore,
}: {
  projectId: string;
  item: ReviewItem;
  document: EasyDocument;
  source: SourceDocument;
  busy: boolean;
  onApplySuggestion: (item: ReviewItem) => void;
  onDismiss: (item: ReviewItem, memo: string) => void;
  onRestore: (item: ReviewItem) => void;
}) {
  const [memo, setMemo] = useState<string | null>(null);
  const { target, evidence } = item;

  const located =
    target.type === "sentence"
      ? findSentence(document, target.sentenceId)
      : null;
  const card =
    located?.card ??
    (target.type === "card" || target.type === "image"
      ? findCard(document, target.cardId)?.card
      : undefined);
  const partyName = card?.partyId
    ? (document.partyNames.find((p) => p.partyId === card.partyId)
        ?.displayName ?? null)
    : null;
  const image = document.images.find(
    (candidate) => candidate.id === evidence.imageId,
  );
  const term =
    target.type === "term"
      ? document.glossary.find((entry) => entry.id === target.termId)
      : undefined;
  const currentText = located?.sentence.text;
  const changedSinceCheck =
    currentText !== undefined &&
    evidence.text !== null &&
    currentText !== evidence.text;
  const texts = new Map(source.paragraphs.map((p) => [p.id, p.text]));
  const gone = target.type === "sentence" && !located;

  return (
    <article
      className="flex flex-col gap-5 px-6 py-6"
      aria-labelledby="review-item-title"
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge variant={REVIEW_STATUS_STYLES[item.level].badge}>
            {REVIEW_STATUS_LABELS[item.level]}
          </Badge>
          <Badge variant="secondary">
            {REVIEW_CATEGORY_LABELS[item.category]}
          </Badge>
          {item.dismissal && (
            <Badge variant={REVIEW_STATUS_STYLES.handled.badge}>
              <HugeiconsIcon
                icon={REVIEW_STATUS_STYLES.handled.icon}
                strokeWidth={2}
              />
              {REVIEW_STATUS_LABELS.handled}
            </Badge>
          )}
        </div>
        <h2 id="review-item-title" className="text-xl font-bold tracking-tight">
          {item.title}
        </h2>
        <p className="text-md leading-relaxed text-muted-foreground">
          {item.detail}
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {(located || card || term || gone) && (
          <Block title="쉬운 자료" paper>
            {gone ? (
              <p className="text-2sm text-muted-foreground">
                점검한 뒤 이 문장이 지워지거나 나뉘었어요. 다시 점검해 주세요.
              </p>
            ) : term ? (
              <div className="flex flex-col gap-1">
                <p className="font-bold">{term.term}</p>
                <p className="leading-relaxed">{term.explanation}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {card && (
                  <CardLabel
                    role={card.role}
                    partyName={partyName}
                    className="text-md"
                  />
                )}
                {located ? (
                  <p className="text-lg leading-relaxed [word-break:keep-all]">
                    {located.sentence.text}
                  </p>
                ) : (
                  card?.sentences.map((sentence) => (
                    <p
                      key={sentence.id}
                      className="text-md leading-relaxed [word-break:keep-all]"
                    >
                      {sentence.text}
                    </p>
                  ))
                )}
                {changedSinceCheck && (
                  <Badge variant="warning">점검 뒤 바뀐 문장이에요</Badge>
                )}
              </div>
            )}
          </Block>
        )}

        {evidence.anchors.length > 0 && (
          <Block title="원문">
            <ul className="flex flex-col gap-2">
              {evidence.anchors.map((anchor) => (
                <li
                  key={`${anchor.paragraphId}:${anchor.start}`}
                  className="rounded-lg bg-primary/10 px-2.5 py-1.5 text-md leading-relaxed"
                >
                  “
                  {texts
                    .get(anchor.paragraphId)
                    ?.slice(anchor.start, anchor.end)}
                  ”
                </li>
              ))}
            </ul>
          </Block>
        )}

        {evidence.structureValue && (
          <Block title="사건 구조">
            <p className="text-md font-semibold">{evidence.structureValue}</p>
          </Block>
        )}

        {image && (
          <Block title="그림">
            <div className="flex gap-3">
              <Image
                src={image.src}
                alt={image.alt}
                width={160}
                height={120}
                unoptimized
                className="aspect-[4/3] w-32 shrink-0 rounded-lg object-cover ring-1 ring-hairline"
              />
              <div className="flex flex-col gap-1 text-2sm">
                <p>
                  <span className="text-muted-foreground">뜻 · </span>
                  {image.meaning || "없음"}
                </p>
                <p>
                  <span className="text-muted-foreground">대체텍스트 · </span>
                  {image.alt || <span className="text-warning">없음</span>}
                </p>
              </div>
            </div>
          </Block>
        )}
      </div>

      {item.suggestion && currentText !== undefined && !item.dismissal && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">제안 수정안</p>
          <DiffView before={currentText} after={item.suggestion.text} />
          <NumberWarning before={currentText} after={item.suggestion.text} />
        </div>
      )}

      {item.dismissal ? (
        <div className="flex flex-col gap-3 rounded-xl bg-secondary p-4">
          <p className="text-2sm">
            <span className="font-semibold">문제없음으로 확인했어요.</span>{" "}
            {item.dismissal.memo && `메모: ${item.dismissal.memo}`}
          </p>
          <Button
            size="sm"
            variant="secondary"
            className="self-start"
            disabled={busy}
            onClick={() => onRestore(item)}
          >
            다시 확인 필요로 되돌리기
          </Button>
        </div>
      ) : memo !== null ? (
        <div className="flex flex-col gap-2 rounded-xl bg-secondary p-4">
          <label className="text-2sm font-semibold" htmlFor="review-memo">
            왜 문제가 없나요? (선택)
          </label>
          <Textarea
            id="review-memo"
            autoFocus
            value={memo}
            placeholder="예: 원문 3쪽과 대조했어요. 표현만 다르고 뜻은 같아요."
            onChange={(event) => setMemo(event.target.value)}
          />
          <div className="flex gap-1.5">
            <Button
              size="sm"
              disabled={busy}
              onClick={() => {
                onDismiss(item, memo);
                setMemo(null);
              }}
            >
              문제없음으로 확인
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setMemo(null)}>
              취소
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {item.suggestion && currentText !== undefined && (
            <Button disabled={busy} onClick={() => onApplySuggestion(item)}>
              수정안 적용
            </Button>
          )}
          {item.target.type === "document" ? (
            <Button
              variant="secondary"
              nativeButton={false}
              render={<Link href={routes.step(projectId, "structure")} />}
            >
              사건 구조 보기
            </Button>
          ) : (
            <Button
              variant="secondary"
              nativeButton={false}
              render={
                <Link href={routes.editor(projectId, editorLinkFor(item))} />
              }
            >
              <HugeiconsIcon
                icon={PencilEdit02Icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              편집기에서 고치기
            </Button>
          )}
          <Button variant="ghost" disabled={busy} onClick={() => setMemo("")}>
            문제없음으로 확인
          </Button>
        </div>
      )}
    </article>
  );
}
