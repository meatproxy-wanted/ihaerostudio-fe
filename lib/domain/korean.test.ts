import { describe, expect, it } from "vitest";

import { hasFinalConsonant, withParticle } from "./korean";

describe("받침 판별", () => {
  it("한글 마지막 글자의 받침을 본다", () => {
    expect(hasFinalConsonant("집주인")).toBe(true);
    expect(hasFinalConsonant("A씨")).toBe(false);
    expect(hasFinalConsonant("세입자")).toBe(false);
  });

  it("괄호 설명은 건너뛰고 앞 단어로 판단한다", () => {
    expect(hasFinalConsonant("원고(재판을 건 사람)")).toBe(false);
    expect(hasFinalConsonant("법원 (가온지방법원)")).toBe(true);
  });

  it("숫자로 끝나면 읽는 소리로 판단한다", () => {
    expect(hasFinalConsonant("1")).toBe(true);
    expect(hasFinalConsonant("2")).toBe(false);
    expect(hasFinalConsonant("10")).toBe(true);
  });
});

describe("조사 붙이기", () => {
  it("받침에 따라 이/가를 고른다", () => {
    expect(withParticle("A씨", "이/가")).toBe("A씨가");
    expect(withParticle("집주인", "이/가")).toBe("집주인이");
  });

  it("받침에 따라 은/는, 을/를, 과/와를 고른다", () => {
    expect(withParticle("세입자", "은/는")).toBe("세입자는");
    expect(withParticle("법원", "은/는")).toBe("법원은");
    expect(withParticle("보증금", "을/를")).toBe("보증금을");
    expect(withParticle("A씨", "과/와")).toBe("A씨와");
  });

  it("괄호 설명이 있으면 괄호 뒤에 조사를 붙인다", () => {
    expect(withParticle("원고(재판을 건 사람)", "이/가")).toBe(
      "원고(재판을 건 사람)가",
    );
  });
});
