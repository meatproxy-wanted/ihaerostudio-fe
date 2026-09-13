/*
 * MOCK ONLY — delete with the rest of lib/mock when the real server lands.
 *
 * Fakes the server's AI review with plain string rules over the document and
 * the case structure, so planted problems are found and disappear once the
 * producer fixes them. None of this is product logic.
 */
import type { Settings } from "../../domain/common";
import type { Card, EasyDocument, Sentence } from "../../domain/document";
import { allSentences, findTermRanges } from "../../domain/document-ops";
import { hasFinalConsonant } from "../../domain/korean";
import type { ReviewItem } from "../../domain/review";
import type { CaseStructure } from "../../domain/structure";
import { extractNumbers } from "../../domain/text-diff";
import { TERM_DICTIONARY } from "../fixtures/sample-assist";
import { illustrationForSrc } from "../illustration-library";

const LONG_SENTENCE = 45;

function hash(text: string) {
  let value = 0;
  for (const char of text) value = (value * 31 + char.charCodeAt(0)) | 0;
  return (value >>> 0).toString(36);
}

type Draft = Omit<ReviewItem, "key" | "dismissal">;

function keyed(item: Draft): ReviewItem {
  const target =
    item.target.type === "sentence"
      ? item.target.sentenceId
      : item.target.type === "card"
        ? item.target.cardId
        : item.target.type === "image"
          ? item.target.imageId
          : item.target.type === "term"
            ? item.target.termId
            : "document";
  return {
    ...item,
    key: `${item.category}:${target}:${hash(item.evidence.text ?? item.title)}`,
    dismissal: null,
  };
}

function cardsWithSentences(document: EasyDocument) {
  return document.sections.flatMap((section) =>
    section.cards.flatMap((card) =>
      card.sentences.map((sentence) => ({ card, sentence })),
    ),
  );
}

function overlaps(
  sentence: Sentence,
  anchors: CaseStructure["keyFacts"][number]["anchors"],
) {
  return sentence.anchors.some((a) =>
    anchors.some(
      (b) =>
        a.paragraphId === b.paragraphId && a.start < b.end && b.start < a.end,
    ),
  );
}

function numberItems(
  document: EasyDocument,
  structure: CaseStructure,
): Draft[] {
  const knownTexts = [
    ...structure.keyFacts.map((fact) => fact.value),
    ...structure.claims.map((claim) => claim.text),
    ...structure.findings.map((finding) => finding.text),
    ...structure.decisions.map((decision) => decision.text),
  ];
  const known = new Set(
    knownTexts.flatMap((text) => extractNumbers(text).map((m) => m.key)),
  );

  const items: Draft[] = [];
  for (const { card, sentence } of cardsWithSentences(document)) {
    for (const mention of extractNumbers(sentence.text)) {
      if (mention.kind !== "money" && mention.kind !== "date") continue;
      if (known.has(mention.key)) continue;
      const fact = structure.keyFacts.find(
        (candidate) =>
          candidate.kind === mention.kind &&
          overlaps(sentence, candidate.anchors),
      );
      const factMention = fact
        ? extractNumbers(fact.value).find((m) => m.kind === mention.kind)
        : undefined;
      items.push({
        category: "numbers",
        level: "required",
        title:
          mention.kind === "money"
            ? "금액이 원문과 달라 보여요"
            : "날짜가 원문과 달라 보여요",
        detail: `문장에 “${mention.text}”${hasFinalConsonant(mention.text) ? "이라고" : "라고"} 되어 있지만 사건 구조의 핵심 사실에서 같은 값을 찾지 못했어요. 원문과 비교해 주세요.`,
        target: { type: "sentence", cardId: card.id, sentenceId: sentence.id },
        evidence: {
          text: sentence.text,
          anchors: sentence.anchors,
          structureValue: fact ? `${fact.label}: ${fact.value}` : null,
          imageId: null,
        },
        suggestion: factMention
          ? { text: sentence.text.replace(mention.text, factMention.text) }
          : null,
      });
    }
  }
  return items;
}

const SAID =
  /(라고|다고)\s*(했어요|했습니다|말했어요|말했습니다|주장했어요|주장했습니다)/;

function claimMixItems(
  document: EasyDocument,
  structure: CaseStructure,
): Draft[] {
  const names = structure.parties
    .map((party) => party.displayName)
    .filter(Boolean);
  const items: Draft[] = [];
  for (const { card, sentence } of cardsWithSentences(document)) {
    const startsWithParty = names.some((name) =>
      new RegExp(`^${name}(은|는|이|가)\\s`).test(sentence.text),
    );
    if (
      (card.role === "finding" || card.role === "decision") &&
      startsWithParty &&
      SAID.test(sentence.text)
    ) {
      items.push({
        category: "claim-mix",
        level: "required",
        title: "법원 카드에 당사자의 주장이 섞여 보여요",
        detail:
          "이 카드는 법원이 판단하거나 결정한 내용을 담아요. 이 문장은 당사자가 한 말이라서 독자가 법원이 인정한 사실로 오해할 수 있어요. 주장 카드로 옮기거나 법원의 판단으로 고쳐 주세요.",
        target: { type: "sentence", cardId: card.id, sentenceId: sentence.id },
        evidence: {
          text: sentence.text,
          anchors: sentence.anchors,
          structureValue: null,
          imageId: null,
        },
        suggestion: null,
      });
    }
    if (card.role === "claim" && /^법원(은|이)\s/.test(sentence.text)) {
      items.push({
        category: "claim-mix",
        level: "required",
        title: "주장 카드에 법원의 판단이 섞여 보여요",
        detail:
          "이 카드는 당사자가 한 말을 담아요. 법원의 판단은 법원 카드에 넣어 주세요.",
        target: { type: "sentence", cardId: card.id, sentenceId: sentence.id },
        evidence: {
          text: sentence.text,
          anchors: sentence.anchors,
          structureValue: null,
          imageId: null,
        },
        suggestion: null,
      });
    }
  }
  return items;
}

function imageItems(document: EasyDocument, settings: Settings): Draft[] {
  if (settings.illustrations === "none") return [];
  const items: Draft[] = [];
  const cards: Card[] = document.sections.flatMap((section) => section.cards);
  for (const card of cards) {
    const image = document.images.find((item) => item.id === card.imageId);
    if (!image) continue;
    const text = card.sentences.map((sentence) => sentence.text).join(" ");
    if (!image.alt.trim()) {
      items.push({
        category: "alt-text",
        level: "required",
        title: "그림에 대체텍스트가 없어요",
        detail:
          "화면 읽기 프로그램을 쓰는 독자는 그림을 볼 수 없어요. 그림이 무엇을 보여 주는지 짧게 적어 주세요.",
        target: { type: "image", cardId: card.id, imageId: image.id },
        evidence: {
          text,
          anchors: [],
          structureValue: null,
          imageId: image.id,
        },
        suggestion: null,
      });
    }
    const tags = illustrationForSrc(image.src)?.tags ?? [];
    const ordersPayment = /(돌려줘야|줘야|주라고|내야|돌려주라)/.test(text);
    if (
      card.role === "decision" &&
      ordersPayment &&
      tags.includes("received")
    ) {
      items.push({
        category: "image-meaning",
        level: "required",
        title: "그림이 결정 내용과 달라 보여요",
        detail: `글은 앞으로 돈을 줘야 한다는 결정인데, 그림은 “${image.meaning}”이에요. 독자가 이미 돈을 받은 것으로 오해할 수 있어요.`,
        target: { type: "image", cardId: card.id, imageId: image.id },
        evidence: {
          text,
          anchors: [],
          structureValue: null,
          imageId: image.id,
        },
        suggestion: null,
      });
    }
  }
  return items;
}

function anchorItems(document: EasyDocument): Draft[] {
  return cardsWithSentences(document)
    .filter(
      ({ sentence }) => sentence.anchors.length === 0 && sentence.text.trim(),
    )
    .map(({ card, sentence }) => ({
      category: "no-anchor" as const,
      level: "required" as const,
      title: "원문 근거가 없는 문장이에요",
      detail:
        "원문에서 이 내용을 찾지 못했어요. AI가 원문에 없는 내용을 덧붙였을 수 있어요. 근거를 이어 주거나 문장을 지워 주세요.",
      target: {
        type: "sentence" as const,
        cardId: card.id,
        sentenceId: sentence.id,
      },
      evidence: {
        text: sentence.text,
        anchors: [],
        structureValue: null,
        imageId: null,
      },
      suggestion: null,
    }));
}

function relationItems(
  document: EasyDocument,
  structure: CaseStructure,
  settings: Settings,
): Draft[] {
  const items: Draft[] = [];
  if (settings.naming !== "legal") {
    for (const { card, sentence } of cardsWithSentences(document)) {
      if (/(원고|피고)/.test(sentence.text)) {
        let fixed = sentence.text;
        for (const party of structure.parties) {
          if (party.legalStatus)
            fixed = fixed.replaceAll(party.legalStatus, party.displayName);
        }
        items.push({
          category: "relations",
          level: "required",
          title: "호칭이 섞여 보여요",
          detail:
            "이 자료는 등장인물을 호칭으로 불러요. 원고·피고가 섞이면 누가 누구인지 헷갈릴 수 있어요.",
          target: {
            type: "sentence",
            cardId: card.id,
            sentenceId: sentence.id,
          },
          evidence: {
            text: sentence.text,
            anchors: sentence.anchors,
            structureValue: null,
            imageId: null,
          },
          suggestion: fixed !== sentence.text ? { text: fixed } : null,
        });
      }
    }
  }
  // Payer and payee from the order line "피고는 원고에게 …".
  const payer = structure.parties.find((party) => party.legalStatus === "피고");
  const payee = structure.parties.find((party) => party.legalStatus === "원고");
  if (payer && payee) {
    const reversed = new RegExp(
      `${payee.displayName}(가|이|는|은)\\s${payer.displayName}에게.*(줘야|돌려줘야|주라고)`,
    );
    for (const { card, sentence } of cardsWithSentences(document)) {
      if (card.role === "decision" && reversed.test(sentence.text)) {
        items.push({
          category: "relations",
          level: "required",
          title: "누가 누구에게 주는지 뒤바뀌어 보여요",
          detail: `최종 결정에서는 ${payer.displayName}가 ${payee.displayName}에게 돈을 줘요. 문장에서는 방향이 반대로 보여요.`,
          target: {
            type: "sentence",
            cardId: card.id,
            sentenceId: sentence.id,
          },
          evidence: {
            text: sentence.text,
            anchors: sentence.anchors,
            structureValue: structure.decisions[0]?.text ?? null,
            imageId: null,
          },
          suggestion: null,
        });
      }
    }
  }
  return items;
}

function readabilityItems(document: EasyDocument): Draft[] {
  const items: Draft[] = [];
  const glossaryTerms = new Set(document.glossary.map((term) => term.term));
  const flagged = new Set<string>();

  for (const { card, sentence } of cardsWithSentences(document)) {
    for (const term of Object.keys(TERM_DICTIONARY)) {
      if (
        glossaryTerms.has(term) ||
        flagged.has(term) ||
        !sentence.text.includes(term)
      )
        continue;
      flagged.add(term);
      items.push({
        category: "hard-term",
        level: "suggested",
        title: `“${term}”에 풀이가 없어요`,
        detail:
          "독자에게 낯선 말일 수 있어요. 쉬운 말로 바꾸거나 어려운 말 풀이에 넣어 주세요.",
        target: { type: "sentence", cardId: card.id, sentenceId: sentence.id },
        evidence: {
          text: sentence.text,
          anchors: sentence.anchors,
          structureValue: null,
          imageId: null,
        },
        suggestion: null,
      });
    }
    if (sentence.text.length > LONG_SENTENCE) {
      items.push({
        category: "long-sentence",
        level: "suggested",
        title: "문장이 길어요",
        detail: `${sentence.text.length}자예요. 한 문장에 한 가지 내용만 담으면 읽기 쉬워요. [문장 나누기]를 써 보세요.`,
        target: { type: "sentence", cardId: card.id, sentenceId: sentence.id },
        evidence: {
          text: sentence.text,
          anchors: sentence.anchors,
          structureValue: null,
          imageId: null,
        },
        suggestion: null,
      });
    }
  }

  const texts = allSentences(document).map((sentence) => sentence.text);
  for (const term of document.glossary) {
    const used = texts.some((text) => findTermRanges(text, [term]).length > 0);
    if (!used) {
      items.push({
        category: "hard-term",
        level: "suggested",
        title: `“${term.term}” 풀이가 문장에 쓰이지 않아요`,
        detail:
          "어느 문장에도 나오지 않는 말이에요. 필요 없으면 풀이에서 빼 주세요.",
        target: { type: "term", termId: term.id },
        evidence: {
          text: term.explanation,
          anchors: [],
          structureValue: null,
          imageId: null,
        },
        suggestion: null,
      });
    }
  }
  return items;
}

export function runMockReview(input: {
  document: EasyDocument;
  structure: CaseStructure;
  settings: Settings;
  draftOutdated: boolean;
}): ReviewItem[] {
  const { document, structure, settings, draftOutdated } = input;
  const drafts: Draft[] = [
    ...numberItems(document, structure),
    ...relationItems(document, structure, settings),
    ...claimMixItems(document, structure),
    ...imageItems(document, settings),
    ...anchorItems(document),
    ...readabilityItems(document),
  ];
  if (draftOutdated) {
    drafts.unshift({
      category: "structure-changed",
      level: "required",
      title: "초안을 만든 뒤 사건 구조가 바뀌었어요",
      detail:
        "바뀐 사건 구조가 이 초안에 반영되지 않았어요. 초안을 다시 만들거나, 달라진 부분을 직접 반영했는지 확인해 주세요.",
      target: { type: "document" },
      evidence: {
        text: null,
        anchors: [],
        structureValue: null,
        imageId: null,
      },
      suggestion: null,
    });
  }
  return drafts.map(keyed);
}
