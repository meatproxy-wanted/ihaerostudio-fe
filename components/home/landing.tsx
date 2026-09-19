"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import Logo from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import GenerateButton from "@/components/ui/GenerateButton";
import { routes } from "@/lib/routes";

/**
 * The gradient wash. It bleeds in from both edges and leaves the middle pale
 * so the headline stays the darkest thing on the page, with a dotted grain
 * over the coloured margins.
 */
function Wash() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -top-1/3 -left-1/4 size-[46rem] rounded-full bg-[radial-gradient(circle,var(--gradient-from)_0%,color-mix(in_oklab,var(--gradient-to),transparent_45%)_45%,transparent_70%)] opacity-60 blur-3xl" />
      <div className="absolute -right-1/4 -bottom-1/3 size-[46rem] rounded-full bg-[radial-gradient(circle,var(--gradient-to)_0%,color-mix(in_oklab,var(--gradient-from),transparent_45%)_45%,transparent_70%)] opacity-55 blur-3xl" />
      <div className="absolute top-1/4 -left-40 size-[28rem] rounded-full bg-[radial-gradient(circle,var(--gradient-to)_0%,transparent_65%)] opacity-35 blur-3xl" />
      {/* Grain, kept to the coloured margins so the centre stays clean. */}
      <div className="absolute inset-0 bg-[radial-gradient(currentColor_1px,transparent_1px)] [mask-image:linear-gradient(90deg,#000_0%,transparent_28%,transparent_72%,#000_100%)] [background-size:14px_14px] text-foreground/20" />
      {/* Pale core, so the centre reads as white paper. */}
      <div className="absolute inset-0 bg-[radial-gradient(60rem_40rem_at_50%_42%,var(--background)_0%,color-mix(in_oklab,var(--background),transparent_25%)_45%,transparent_72%)]" />
    </div>
  );
}

export function Landing() {
  const router = useRouter();

  return (
    <div className="landing relative isolate flex min-h-svh flex-col">
      <Wash />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-6 sm:px-6">
        <Link
          href={routes.home()}
          className="flex shrink-0 items-center rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/25"
          aria-label="이해로 스튜디오 홈으로 가기"
        >
          <Logo size={24} />
        </Link>

        {/* The design system's neutral, not a hand-rolled pill, so the wordmark
            button stays in step with the rest of the buttons. */}
        <Button
          variant="neutral"
          nativeButton={false}
          render={<Link href={routes.newProject({ sample: true })} />}
          className="ml-auto h-11 shrink-0 rounded-full px-6 text-2sm"
        >
          샘플로 체험하기
        </Button>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-5 px-4 pb-40 text-center sm:px-6">
        {/* Tagline, headline, wordmark, then the promise. The name sits
            under the claim it belongs to rather than above it. */}
        <p className="text-[length:var(--hero-tagline)] leading-[1.3] font-bold tracking-tight text-foreground">
          어려운 판결문에 쉬운 말을 더하다
        </p>

        <h1 className="hero-headline text-[length:var(--hero-size)] leading-[1.12] font-extrabold tracking-[-0.01em] whitespace-nowrap">
          판결문을 누구나 읽을 수 있게
        </h1>

        {/*
          The wordmark at hero scale, under the line it belongs to. Text only
          — the symbol is already on the bar above. Not a link either; the
          header carries the one that navigates.

          Pulled up against the headline: the logo's own box is 1.25x its
          font size, so it arrives with about an eighth of that as padding
          above the letters before the column's gap is even counted.
        */}
        <Logo layout="text-only" size="var(--hero-size)" className="-mt-4" />

        <p className="text-[length:var(--hero-body)] leading-[var(--hero-body-leading)] font-bold text-muted-foreground">
          AI가 사건 구조를 정리하면
          <br />
          제작자가 원문과 대조하며 쉬운 설명자료로 다듬습니다
        </p>

        {/*
          The column is centred, so moving one thing without moving the other
          takes a pair of equal moves. `mt` and `pb` have been tuned together
          that way: the text sits 32px above where centring would put it, and
          the button 16px above that again. Change one of the two and the
          whole group slides — change both by the same amount, in opposite
          directions, to move only the button.
        */}
        <div className="mt-10">
          {/*
            GenerateButton renders a <button>, so this navigates through the
            router rather than an <a>. Cmd-click does not open a new tab here.
          */}
          <GenerateButton
            hug
            icon="→"
            onClick={() => router.push(routes.materials())}
          >
            시작하기
          </GenerateButton>
        </div>
      </main>
    </div>
  );
}
