/*
 * MOCK ONLY — delete with the rest of lib/mock when the real server lands.
 *
 * The "AI" draft for the sample judgment. It deliberately contains problems
 * for the review step to find:
 * - a wrong amount (보증금 1,000만 원 instead of 1억 원)
 * - a party's claim inside a court finding card
 * - a sentence with no source anchor (A씨는 무척 속상했어요)
 * - an unexplained legal term (임대차계약)
 * - a decision card whose picture shows money already received
 * - a picture without alt text
 * - a long sentence that needs splitting
 */
import type { Anchor } from "../../domain/common";
import type {
  Card,
  CardRole,
  DocImage,
  EasyDocument,
} from "../../domain/document";
import { illustrationSrc, findIllustration } from "../illustration-library";
import { quote } from "./anchor";

interface CardSpec {
  id: string;
  role: CardRole;
  partyId?: string;
  illustration?: string;
  /** Overrides the library alt text; "" reproduces a missing alt text. */
  alt?: string;
  sentences: [text: string, anchors: Anchor[]][];
}

function buildCard(spec: CardSpec, images: DocImage[]): Card {
  let imageId: string | null = null;
  if (spec.illustration) {
    const illustration = findIllustration(spec.illustration);
    if (!illustration)
      throw new Error(`Unknown illustration ${spec.illustration}`);
    imageId = `img-${spec.id}`;
    images.push({
      id: imageId,
      src: illustrationSrc(illustration.id),
      alt: spec.alt ?? illustration.alt,
      meaning: illustration.meaning,
      source: "library",
    });
  }
  return {
    id: spec.id,
    role: spec.role,
    partyId: spec.partyId ?? null,
    imageId,
    sentences: spec.sentences.map(([text, anchors], index) => ({
      id: `${spec.id}-s${index + 1}`,
      text,
      anchors,
      origin: "ai-draft",
      verified: false,
    })),
  };
}

const PEOPLE: CardSpec[] = [
  {
    id: "card-person-a",
    role: "person",
    partyId: "party-a",
    illustration: "tenant",
    sentences: [
      [
        "A씨는 B씨의 집을 빌려 살았던 사람이에요.",
        [quote("s-18", "이 사건 주택을 인도받아 거주하였다")],
      ],
      ["A씨가 재판을 시작했어요.", [quote("s-04", "원고 A")]],
    ],
  },
  {
    id: "card-person-b",
    role: "person",
    partyId: "party-b",
    illustration: "landlord",
    sentences: [
      [
        "B씨는 A씨에게 집을 빌려준 집주인이에요.",
        [quote("s-17", "피고 소유의 가온시 한빛로 12, 301호")],
      ],
    ],
  },
  {
    id: "card-court",
    role: "background",
    illustration: "court",
    sentences: [
      ["재판은 가온지방법원에서 했어요.", [quote("s-02", "가온지방법원")]],
    ],
  },
];

const DECISION: CardSpec[] = [
  {
    id: "card-decision-pay",
    role: "decision",
    illustration: "money-received",
    sentences: [
      [
        "법원은 B씨가 A씨에게 보증금 9,850만 원을 돌려줘야 한다고 결정했어요.",
        [quote("s-09", "피고는 원고에게 98,500,000원")],
      ],
      [
        "B씨는 돈을 늦게 돌려준 만큼 이자도 더 줘야 해요.",
        [
          quote(
            "s-09",
            "2024. 3. 1.부터 2024. 6. 12.까지는 연 5%의, 그 다음 날부터 다 갚는 날까지는 연 12%의 각 비율로 계산한 돈을 지급하라",
          ),
        ],
      ],
    ],
  },
  {
    id: "card-decision-rest",
    role: "decision",
    illustration: "cost-split",
    sentences: [
      [
        "A씨가 달라고 한 돈 중 150만 원은 받지 못해요.",
        [quote("s-10", "원고의 나머지 청구를 기각한다.")],
      ],
      [
        "재판에 든 비용은 B씨가 대부분 내고, A씨도 조금 내요.",
        [
          quote(
            "s-11",
            "소송비용 중 10분의 1은 원고가, 나머지는 피고가 각 부담한다.",
          ),
        ],
      ],
    ],
  },
];

const REASONS: CardSpec[] = [
  {
    id: "card-contract",
    role: "background",
    illustration: "contract",
    sentences: [
      [
        "A씨와 B씨는 2022년 3월 1일에 임대차계약을 했어요.",
        [quote("s-17", "원고는 2022. 3. 1. 피고와 사이에")],
      ],
      [
        "보증금은 1,000만 원이었어요.",
        [quote("s-17", "임대차보증금 100,000,000원")],
      ],
      [
        "빌리기로 한 기간은 2년이었어요.",
        [quote("s-17", "임대차기간 2022. 3. 1.부터 2024. 2. 29.까지")],
      ],
    ],
  },
  {
    id: "card-move-out",
    role: "background",
    illustration: "moving-out",
    sentences: [
      [
        "A씨는 약속한 기간이 끝나고 집을 비워 줬어요.",
        [quote("s-20", "원고는 2024. 2. 29. 이 사건 주택에서 퇴거하면서")],
      ],
      [
        "그런데 B씨는 보증금을 돌려주지 않았어요.",
        [
          quote(
            "s-21",
            "피고는 현재까지 원고에게 임대차보증금을 반환하지 않고 있다.",
          ),
        ],
      ],
      ["A씨는 무척 속상했어요.", []],
    ],
  },
  {
    id: "card-claim-a",
    role: "claim",
    partyId: "party-a",
    illustration: "asking-money-back",
    sentences: [
      [
        "A씨는 보증금 1억 원과 이자를 돌려 달라고 했어요.",
        [
          quote(
            "s-25",
            "피고는 원고에게 임대차보증금 100,000,000원과 이에 대한 지연손해금을 지급할 의무가 있다.",
          ),
        ],
      ],
    ],
  },
  {
    id: "card-claim-b",
    role: "claim",
    partyId: "party-b",
    illustration: "refusing",
    sentences: [
      [
        "B씨는 새로 들어올 사람을 못 구해서 돈을 돌려줄 수 없다고 했어요.",
        [
          quote(
            "s-27",
            "새로운 임차인이 구해지지 않아 임대차보증금을 반환할 수 없다.",
          ),
        ],
      ],
      [
        "B씨는 A씨가 벽지와 바닥을 망가뜨려서 고치는 데 700만 원이 들었으니 그 돈은 빼고 돌려주겠다고 했어요.",
        [quote("s-28")],
      ],
    ],
  },
  {
    id: "card-finding-ended",
    role: "finding",
    illustration: "weighing",
    sentences: [
      [
        "법원은 약속한 기간이 끝났으니 B씨가 보증금을 돌려줘야 한다고 봤어요.",
        [
          quote(
            "s-31",
            "이 사건 임대차계약은 2024. 2. 29. 기간 만료로 종료되었다.",
          ),
          quote(
            "s-31",
            "따라서 피고는 원고에게 임대차보증금을 반환할 의무가 있다.",
          ),
        ],
      ],
      [
        "새로 들어올 사람을 못 구한 것은 돈을 돌려주지 않을 이유가 되지 않는다고 했어요.",
        [quote("s-33")],
      ],
    ],
  },
  {
    id: "card-finding-damage",
    role: "finding",
    illustration: "wallpaper-damage",
    alt: "",
    sentences: [
      [
        "법원은 A씨가 거실 벽지를 망가뜨린 것은 맞다고 봤어요.",
        [quote("s-35", "거실 벽지 일부가 찢어지고 오염된 사실이 인정되고")],
      ],
      [
        "그래서 벽지를 새로 바르는 돈 150만 원은 보증금에서 빼기로 했어요.",
        [
          quote(
            "s-35",
            "거실 벽지를 새로 바르는 비용은 1,500,000원이므로, 이 금액은 임대차보증금에서 공제되어야 한다.",
          ),
        ],
      ],
      [
        "B씨는 A씨가 안방 바닥도 망가뜨렸다고 했어요.",
        [quote("s-28", "안방 바닥재를 훼손하여")],
      ],
      [
        "하지만 법원은 바닥은 증거가 부족하다고 봤어요.",
        [
          quote(
            "s-36",
            "피고가 제출한 증거만으로는 원고가 안방 바닥재를 훼손하였다거나",
          ),
        ],
      ],
    ],
  },
];

export function createSampleDraft(
  projectId: string,
  revisions: { structure: number; settings: number },
): EasyDocument {
  const images: DocImage[] = [];
  const cards = (specs: CardSpec[]) =>
    specs.map((spec) => buildCard(spec, images));

  return {
    projectId,
    title: "집 보증금 재판 결과를 쉽게 알려 드려요",
    subtitle: "법원이 무엇을 결정했는지, 왜 그렇게 결정했는지 알려 드려요.",
    saveRevision: 1,
    contentRevision: 1,
    basedOnStructureRevision: revisions.structure,
    basedOnSettingsRevision: revisions.settings,
    partyNames: [
      { partyId: "party-a", displayName: "A씨" },
      { partyId: "party-b", displayName: "B씨" },
    ],
    sections: [
      { kind: "people", title: "누가 나오나요?", cards: cards(PEOPLE) },
      {
        kind: "decision",
        title: "법원은 무엇을 결정했나요?",
        cards: cards(DECISION),
      },
      {
        kind: "reasons",
        title: "왜 그렇게 결정했나요?",
        cards: cards(REASONS),
      },
      { kind: "glossary", title: "어려운 말 풀이", cards: [] },
    ],
    glossary: [
      {
        id: "term-deposit",
        term: "보증금",
        explanation:
          "집을 빌릴 때 집주인에게 맡기는 돈이에요. 집을 비워 주면 돌려받아요.",
      },
      {
        id: "term-interest",
        term: "이자",
        explanation: "돈을 늦게 주면 그만큼 더 붙는 돈이에요.",
      },
      {
        id: "term-trial",
        term: "재판",
        explanation: "법원에서 누구 말이 맞는지 따져 보고 결정하는 일이에요.",
      },
    ],
    images,
  };
}
