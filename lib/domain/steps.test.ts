import { describe, expect, it } from "vitest";

import { DEFAULT_SETTINGS } from "./common";
import type { Project } from "./project";
import {
  canEnterStep,
  getPublicationStatus,
  getResumeStep,
  getReviewStatus,
  getSteps,
  isDraftOutdated,
  type StepKey,
} from "./steps";

const NOW = "2026-09-13T00:00:00.000Z";

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: "project-1",
    title: "임대차보증금 반환 사건",
    createdAt: NOW,
    updatedAt: NOW,
    settings: DEFAULT_SETTINGS,
    settingsRevision: 0,
    source: { kind: "text", fileName: null, byteSize: null, charCount: 2400 },
    caseNumber: "2024가단10234",
    structureRevision: 2,
    document: null,
    review: {
      checkedContentRevision: null,
      openRequiredCount: null,
      completedContentRevision: null,
      completedAt: null,
    },
    publication: {
      latestVersion: null,
      latestContentRevision: null,
      publicPublicationId: null,
      publicVersion: null,
    },
    ...overrides,
  };
}

function withDraft(
  overrides: Partial<Project> = {},
  document: Partial<NonNullable<Project["document"]>> = {},
): Project {
  return makeProject({
    document: {
      saveRevision: 10,
      contentRevision: 4,
      basedOnStructureRevision: 2,
      basedOnSettingsRevision: 0,
      sentenceCount: 30,
      verifiedCount: 12,
      ...document,
    },
    ...overrides,
  });
}

function statusOf(project: Project, key: StepKey) {
  return getSteps(project).find((step) => step.key === key)?.status;
}

describe("단계 진입", () => {
  it("초안이 없으면 사건 구조 단계만 들어갈 수 있다", () => {
    const project = makeProject();

    expect(canEnterStep(project, "structure")).toBe(true);
    for (const key of ["edit", "review", "preview", "export"] as const) {
      expect(canEnterStep(project, key)).toBe(false);
    }
  });

  it("초안이 있으면 사건 구조부터 내보내기까지 모두 들어갈 수 있다", () => {
    const project = withDraft();

    for (const key of [
      "structure",
      "edit",
      "review",
      "preview",
      "export",
    ] as const) {
      expect(canEnterStep(project, key)).toBe(true);
    }
  });

  it("올리기 단계는 자료를 만든 뒤 다시 들어가지 않고 완료로만 보인다", () => {
    const project = withDraft();

    expect(canEnterStep(project, "upload")).toBe(false);
    expect(statusOf(project, "upload")).toBe("done");
  });

  it("단계는 1부터 6까지 순서대로 번호가 붙는다", () => {
    expect(getSteps(makeProject()).map((step) => step.number)).toEqual([
      1, 2, 3, 4, 5, 6,
    ]);
  });
});

describe("초안과 사건 구조", () => {
  it("초안이 없으면 사건 구조 단계는 아직 할 일이다", () => {
    expect(statusOf(makeProject(), "structure")).toBe("todo");
  });

  it("초안을 만든 뒤 구조를 고치지 않았으면 사건 구조 단계는 완료다", () => {
    const project = withDraft();

    expect(isDraftOutdated(project)).toBe(false);
    expect(statusOf(project, "structure")).toBe("done");
  });

  it("초안을 만든 뒤 구조가 바뀌면 초안이 뒤처지고 사건 구조 단계에 주의가 뜬다", () => {
    const project = withDraft({ structureRevision: 3 });

    expect(isDraftOutdated(project)).toBe(true);
    expect(statusOf(project, "structure")).toBe("attention");
  });

  it("초안을 만든 뒤 설정이 바뀌어도 초안이 뒤처진다", () => {
    const project = withDraft({ settingsRevision: 1 });

    expect(isDraftOutdated(project)).toBe(true);
  });
});

describe("검토 상태", () => {
  it("초안이 없으면 검토할 수 없다", () => {
    expect(getReviewStatus(makeProject())).toBe("unavailable");
  });

  it("한 번도 점검하지 않았으면 시작 전이다", () => {
    expect(getReviewStatus(withDraft())).toBe("not-started");
  });

  it("점검했지만 마치지 않았으면 진행 중이다", () => {
    const project = withDraft({
      review: {
        checkedContentRevision: 4,
        openRequiredCount: 3,
        completedContentRevision: null,
        completedAt: null,
      },
    });

    expect(getReviewStatus(project)).toBe("in-progress");
    expect(statusOf(project, "review")).toBe("todo");
  });

  it("지금 내용으로 검토를 마쳤으면 완료다", () => {
    const project = withDraft({
      review: {
        checkedContentRevision: 4,
        openRequiredCount: 0,
        completedContentRevision: 4,
        completedAt: NOW,
      },
    });

    expect(getReviewStatus(project)).toBe("completed");
    expect(statusOf(project, "review")).toBe("done");
  });

  it("검토를 마친 뒤 독자에게 보이는 내용이 바뀌면 검토 후 수정됨이다", () => {
    const project = withDraft(
      {
        review: {
          checkedContentRevision: 4,
          openRequiredCount: 0,
          completedContentRevision: 4,
          completedAt: NOW,
        },
      },
      { contentRevision: 5 },
    );

    expect(getReviewStatus(project)).toBe("stale");
    expect(statusOf(project, "review")).toBe("stale");
  });

  it("저장 번호만 바뀌고 내용 번호가 같으면 검토 완료가 유지된다", () => {
    const project = withDraft(
      {
        review: {
          checkedContentRevision: 4,
          openRequiredCount: 0,
          completedContentRevision: 4,
          completedAt: NOW,
        },
      },
      { saveRevision: 25, verifiedCount: 30 },
    );

    expect(getReviewStatus(project)).toBe("completed");
  });
});

describe("게시 상태", () => {
  it("내보낸 적이 없으면 아직 없음이다", () => {
    const project = withDraft();

    expect(getPublicationStatus(project)).toBe("none");
    expect(statusOf(project, "export")).toBe("todo");
  });

  it("최신 게시본이 지금 내용과 같으면 완료다", () => {
    const project = withDraft({
      publication: {
        latestVersion: 2,
        latestContentRevision: 4,
        publicPublicationId: null,
        publicVersion: null,
      },
    });

    expect(getPublicationStatus(project)).toBe("current");
    expect(statusOf(project, "export")).toBe("done");
  });

  it("최신 게시본 이후 내용이 바뀌면 게시본 이후 수정됨이다", () => {
    const project = withDraft(
      {
        publication: {
          latestVersion: 2,
          latestContentRevision: 4,
          publicPublicationId: "pub-2",
          publicVersion: 2,
        },
      },
      { contentRevision: 6 },
    );

    expect(getPublicationStatus(project)).toBe("stale");
    expect(statusOf(project, "export")).toBe("stale");
  });
});

describe("이어서 할 단계", () => {
  it("초안이 없으면 사건 구조 확인으로 간다", () => {
    expect(getResumeStep(makeProject())).toBe("structure");
  });

  it("초안은 있는데 점검한 적이 없으면 편집으로 간다", () => {
    expect(getResumeStep(withDraft())).toBe("edit");
  });

  it("검토를 마치지 않았으면 검토로 간다", () => {
    const project = withDraft({
      review: {
        checkedContentRevision: 3,
        openRequiredCount: 2,
        completedContentRevision: null,
        completedAt: null,
      },
    });

    expect(getResumeStep(project)).toBe("review");
  });

  it("검토 후 수정됐으면 검토로 간다", () => {
    const project = withDraft(
      {
        review: {
          checkedContentRevision: 4,
          openRequiredCount: 0,
          completedContentRevision: 4,
          completedAt: NOW,
        },
      },
      { contentRevision: 5 },
    );

    expect(getResumeStep(project)).toBe("review");
  });

  it("검토를 마쳤으면 내보내기로 간다", () => {
    const project = withDraft({
      review: {
        checkedContentRevision: 4,
        openRequiredCount: 0,
        completedContentRevision: 4,
        completedAt: NOW,
      },
    });

    expect(getResumeStep(project)).toBe("export");
  });
});
