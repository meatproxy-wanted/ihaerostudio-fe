/*
 * MOCK ONLY — delete with the rest of lib/mock when the real server lands.
 *
 * What the "AI" extracts from the sample judgment. One finding is deliberately
 * a party's claim with a flag, so producers can practice moving it.
 */
import type { CaseStructure } from "../../domain/structure";
import { quote } from "./anchor";

export function createSampleStructure(projectId: string): CaseStructure {
  return {
    projectId,
    revision: 1,
    overview: {
      caseName: "임대차보증금 반환",
      caseNumber: "2024가단10234",
      court: "가온지방법원",
      decisionDate: "2024-06-12",
    },
    parties: [
      {
        id: "party-a",
        sourceLabel: "원고 A",
        legalStatus: "원고",
        displayName: "A씨",
        easyRole: "집을 빌려 살았던 사람",
        anchors: [quote("s-04", "원고 A")],
        flags: [],
      },
      {
        id: "party-b",
        sourceLabel: "피고 B",
        legalStatus: "피고",
        displayName: "B씨",
        easyRole: "집을 빌려준 집주인",
        anchors: [quote("s-05", "피고 B")],
        flags: [],
      },
    ],
    keyFacts: [
      {
        id: "fact-deposit",
        kind: "money",
        label: "임대차보증금",
        value: "1억 원 (100,000,000원)",
        anchors: [quote("s-17", "임대차보증금 100,000,000원")],
        flags: [],
      },
      {
        id: "fact-rent",
        kind: "money",
        label: "월세",
        value: "50만 원 (500,000원)",
        anchors: [quote("s-17", "월 차임 500,000원")],
        flags: [],
      },
      {
        id: "fact-period",
        kind: "period",
        label: "빌리기로 한 기간",
        value: "2022. 3. 1. ~ 2024. 2. 29. (2년)",
        anchors: [quote("s-17", "임대차기간 2022. 3. 1.부터 2024. 2. 29.까지")],
        flags: [],
      },
      {
        id: "fact-move-out",
        kind: "date",
        label: "집을 비워 준 날",
        value: "2024. 2. 29.",
        anchors: [
          quote("s-20", "원고는 2024. 2. 29. 이 사건 주택에서 퇴거하면서"),
        ],
        flags: [],
      },
      {
        id: "fact-repair-claimed",
        kind: "money",
        label: "B씨가 말한 수리비",
        value: "700만 원 (7,000,000원)",
        anchors: [quote("s-28", "원상복구 비용으로 7,000,000원이 들었으므로")],
        flags: [],
      },
      {
        id: "fact-deduction",
        kind: "money",
        label: "보증금에서 빼는 벽지 비용",
        value: "150만 원 (1,500,000원)",
        anchors: [quote("s-35", "거실 벽지를 새로 바르는 비용은 1,500,000원")],
        flags: [],
      },
      {
        id: "fact-award",
        kind: "money",
        label: "돌려받을 돈",
        value: "9,850만 원 (98,500,000원)",
        anchors: [quote("s-09", "98,500,000원")],
        flags: [],
      },
      {
        id: "fact-ruling-date",
        kind: "date",
        label: "판결 선고일",
        value: "2024. 6. 12.",
        anchors: [quote("s-07", "판결선고 2024. 6. 12.")],
        flags: [],
      },
    ],
    claims: [
      {
        id: "claim-a-deposit",
        partyId: "party-a",
        text: "임대차계약이 기간 만료로 끝났으니, 피고는 보증금 1억 원과 늦게 준 데 대한 지연손해금을 줘야 한다.",
        anchors: [quote("s-25")],
        flags: [],
      },
      {
        id: "claim-b-new-tenant",
        partyId: "party-b",
        text: "새 세입자가 구해지지 않아 보증금을 돌려줄 수 없다.",
        anchors: [
          quote(
            "s-27",
            "새로운 임차인이 구해지지 않아 임대차보증금을 반환할 수 없다.",
          ),
        ],
        flags: [],
      },
      {
        id: "claim-b-repair",
        partyId: "party-b",
        text: "원고가 거실 벽지와 안방 바닥재를 망가뜨려 수리비 700만 원이 들었으니 보증금에서 빼야 한다.",
        anchors: [quote("s-28")],
        flags: [],
      },
    ],
    findings: [
      {
        id: "finding-ended",
        text: "임대차계약은 2024. 2. 29. 기간이 끝나 종료되었으므로, 피고는 보증금을 돌려줄 의무가 있다.",
        claimIds: ["claim-a-deposit"],
        stance: "accepted",
        anchors: [
          quote(
            "s-31",
            "이 사건 임대차계약은 2024. 2. 29. 기간 만료로 종료되었다.",
          ),
          quote(
            "s-31",
            "따라서 피고는 원고에게 임대차보증금을 반환할 의무가 있다.",
          ),
        ],
        flags: [],
      },
      {
        id: "finding-new-tenant",
        text: "새 세입자가 구해졌는지와 상관없이 보증금을 돌려줘야 하므로, 피고의 주장은 받아들이지 않는다.",
        claimIds: ["claim-b-new-tenant"],
        stance: "rejected",
        anchors: [quote("s-33")],
        flags: [],
      },
      {
        id: "finding-wallpaper",
        text: "거실 벽지 훼손은 인정되므로, 새로 바르는 비용 150만 원은 보증금에서 뺀다.",
        claimIds: ["claim-b-repair"],
        stance: "partial",
        anchors: [
          quote("s-35", "거실 벽지 일부가 찢어지고 오염된 사실이 인정되고"),
          quote(
            "s-35",
            "거실 벽지를 새로 바르는 비용은 1,500,000원이므로, 이 금액은 임대차보증금에서 공제되어야 한다.",
          ),
        ],
        flags: [],
      },
      {
        id: "finding-floor",
        text: "안방 바닥재 훼손은 증거가 부족해 인정하지 않는다.",
        claimIds: ["claim-b-repair"],
        stance: "rejected",
        anchors: [quote("s-36")],
        flags: [],
      },
      {
        id: "finding-floor-misread",
        text: "원고가 안방 바닥재도 훼손하였다.",
        claimIds: [],
        stance: "none",
        anchors: [quote("s-28", "안방 바닥재를 훼손하여")],
        flags: [
          {
            code: "looks-like-claim",
            message:
              "피고의 주장에 나오는 문장이에요. 법원이 인정한 내용이 맞는지 확인해 주세요.",
          },
        ],
      },
    ],
    decisions: [
      {
        id: "decision-pay",
        text: "피고는 원고에게 9,850만 원과, 2024. 3. 1.부터 2024. 6. 12.까지는 연 5%, 그다음 날부터 다 갚을 때까지는 연 12%의 지연손해금을 줘야 한다.",
        anchors: [quote("s-09")],
        flags: [],
      },
      {
        id: "decision-rest",
        text: "원고의 나머지 청구는 받아들이지 않는다.",
        anchors: [quote("s-10")],
        flags: [],
      },
      {
        id: "decision-costs",
        text: "재판 비용은 원고가 10분의 1, 피고가 나머지를 낸다.",
        anchors: [quote("s-11")],
        flags: [
          {
            code: "check-ratio",
            message: "비용을 나누는 비율이 원문과 같은지 확인해 주세요.",
          },
        ],
      },
      {
        id: "decision-provisional",
        text: "1번 결정은 판결이 확정되기 전에도 먼저 집행할 수 있다.",
        anchors: [quote("s-12")],
        flags: [],
      },
    ],
  };
}
