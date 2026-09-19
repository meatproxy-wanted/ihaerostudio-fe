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

      <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-5 px-4 pb-28 text-center sm:px-6">
        {/* Tagline, wordmark, then the promise — the rhythm a product hero
            reads best in: one short line, one large one, two calm ones. */}
        <p className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
          어려운 판결문에 쉬운 말을 더하다
        </p>

        <h1 className="hero-headline text-5xl leading-[1.12] font-bold tracking-tight sm:text-6xl md:text-7xl">
          판결문을 누구나
          <br />
          읽을 수 있게
        </h1>

        <p className="text-md leading-[2] text-muted-foreground sm:text-lg">
          AI가 사건 구조를 정리하면
          <br />
          제작자가 원문과 대조하며 쉬운 설명자료로 다듬습니다
        </p>

        <div className="mt-6">
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
