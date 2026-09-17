"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useMutation, useQuery } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  ImageUploadIcon,
  ImageNotFound01Icon,
} from "@hugeicons/core-free-icons";

import { useCurrentProject } from "@/components/project-shell/project-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { errorMessage } from "@/lib/api/errors";
import type { ImageCandidate } from "@/lib/api/types";
import type { DocImage } from "@/lib/domain/document";
import {
  findCard,
  setCardImage,
  updateImageText,
} from "@/lib/domain/document-ops";
import { newClientId } from "@/lib/ids";
import { cn } from "@/lib/utils";

import { useEditor, useEditorStore } from "../editor-store";
import { ToolError, ToolFrame, ToolLoading } from "./tool-frame";

const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPTED = ["image/png", "image/jpeg", "image/svg+xml"];

function Thumb({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={160}
      height={120}
      unoptimized
      className="aspect-4/3 w-full rounded-lg object-cover ring-1 ring-hairline"
    />
  );
}

/** Commits on blur or Enter so typing does not flood the undo history. */
function CommitInput({
  label,
  value,
  placeholder,
  onCommit,
  invalid,
}: {
  label: string;
  value: string;
  placeholder: string;
  onCommit: (value: string) => void;
  invalid?: boolean;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const commit = () => {
    if (draft !== null && draft !== value) onCommit(draft.trim());
    setDraft(null);
  };
  return (
    <label className="flex flex-col gap-1">
      <span className="text-2sm font-medium text-muted-foreground">
        {label}
      </span>
      <Input
        size="sm"
        value={draft ?? value}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit();
        }}
      />
    </label>
  );
}

export function ImageTool({
  cardId,
  closable = true,
}: {
  cardId: string;
  closable?: boolean;
}) {
  const project = useCurrentProject();
  const store = useEditorStore();
  const card = useEditor((state) => findCard(state.value, cardId)?.card);
  const image = useEditor((state) =>
    state.value.images.find((item) => item.id === card?.imageId),
  );
  const [browsing, setBrowsing] = useState(false);
  const [candidate, setCandidate] = useState<ImageCandidate | null>(null);
  const [candidateAlt, setCandidateAlt] = useState("");
  const [upload, setUpload] = useState<{
    file: File;
    preview: string;
    alt: string;
    meaning: string;
  } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const candidates = useQuery({
    queryKey: queryKeys.assist.images(project.id, cardId),
    queryFn: ({ signal }) =>
      api.assist.imageCandidates(project.id, { cardId }, { signal }),
    enabled: browsing && card?.role !== "person",
    staleTime: Infinity,
    retry: 0,
  });

  const uploadImage = useMutation({
    mutationFn: (input: { file: File; alt: string; meaning: string }) =>
      api.assist.uploadImage(project.id, input),
    onSuccess: ({ image: uploaded }) => {
      replace(uploaded, "내 그림으로 바꿨어요");
      clearUpload();
    },
    onError: (error) =>
      toast.add({
        title: "그림을 올리지 못했어요",
        description: errorMessage(error),
        type: "error",
      }),
  });

  if (!card) return null;
  if (card.role === "person")
    return (
      <ToolFrame title="고정된 등장인물" closable={closable}>
        {image && <Thumb src={image.src} alt={image.alt} />}
        <p className="text-2sm text-muted-foreground">
          등장인물의 기준 그림은 자동 생성 후 고정돼요. 글과 다른 장면 그림은
          편집할 수 있어요.
        </p>
        {image && (
          <CommitInput
            label="대체텍스트"
            value={image.alt}
            placeholder="등장인물 그림을 설명해 주세요"
            onCommit={(alt) => {
              store
                .getState()
                .apply((document) =>
                  updateImageText(document, image.id, { alt }),
                );
            }}
          />
        )}
      </ToolFrame>
    );

  function clearUpload() {
    if (upload) URL.revokeObjectURL(upload.preview);
    setUpload(null);
  }

  function replace(next: DocImage | null, message: string) {
    store.getState().apply((document) => setCardImage(document, cardId, next));
    setCandidate(null);
    setBrowsing(false);
    toast.add({ title: message, type: "success" });
  }

  function chooseFile(file: File | undefined) {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      toast.add({
        title: "PNG, JPG, SVG 그림만 올릴 수 있어요",
        type: "error",
      });
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.add({ title: "2MB 이하의 그림만 올릴 수 있어요", type: "error" });
      return;
    }
    setUpload({
      file,
      preview: URL.createObjectURL(file),
      alt: "",
      meaning: "",
    });
  }

  return (
    <ToolFrame title="그림 바꾸기" closable={closable}>
      <div className="grid grid-cols-[96px_1fr] gap-3">
        {image ? (
          <Thumb src={image.src} alt={image.alt} />
        ) : (
          <span className="flex aspect-4/3 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground">
            <HugeiconsIcon icon={ImageNotFound01Icon} strokeWidth={2} />
          </span>
        )}
        <div className="flex flex-col gap-1">
          <p className="text-2sm font-semibold text-muted-foreground">
            지금 그림
          </p>
          <p className="text-2sm leading-snug">
            {image ? image.meaning || "의미 설명 없음" : "그림이 없어요"}
          </p>
        </div>
      </div>

      {image && (
        <div className="flex flex-col gap-2">
          {!image.alt && (
            <p className="flex items-start gap-1.5 rounded-lg bg-warning/10 px-2.5 py-1.5 text-2sm text-warning">
              <HugeiconsIcon
                icon={Alert02Icon}
                strokeWidth={2}
                size={15}
                className="mt-0.5"
              />
              대체텍스트가 없어요. 화면 읽기 프로그램을 쓰는 독자를 위해 적어
              주세요.
            </p>
          )}
          <CommitInput
            key={`alt-${image.id}`}
            label="대체텍스트 (그림을 말로 설명)"
            placeholder="예: 집 앞에 선 사람"
            value={image.alt}
            invalid={!image.alt}
            onCommit={(alt) =>
              store
                .getState()
                .apply((document) =>
                  updateImageText(document, image.id, { alt }),
                )
            }
          />
          <CommitInput
            key={`meaning-${image.id}`}
            label="의미 설명 (무엇을 나타내는 그림인지)"
            placeholder="예: 돈을 돌려주라고 결정하는 모습"
            value={image.meaning}
            onCommit={(meaning) =>
              store
                .getState()
                .apply((document) =>
                  updateImageText(document, image.id, { meaning }),
                )
            }
          />
        </div>
      )}

      {candidate ? (
        <div className="flex flex-col gap-2.5 rounded-xl bg-card p-3 ring-1 ring-hairline">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-muted-foreground">
                지금
              </span>
              {image ? (
                <Thumb src={image.src} alt={image.alt} />
              ) : (
                <span className="aspect-4/3 rounded-lg border border-dashed border-border" />
              )}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-success">
                바꿀 그림
              </span>
              <Thumb src={candidate.src} alt={candidate.alt} />
            </div>
          </div>
          <p className="text-2sm">{candidate.meaning}</p>
          <label className="flex flex-col gap-1">
            <span className="text-2sm font-medium text-muted-foreground">
              대체텍스트
            </span>
            <Input
              size="sm"
              value={candidateAlt}
              onChange={(event) => setCandidateAlt(event.target.value)}
            />
          </label>
          <div className="flex gap-1.5">
            <Button
              size="sm"
              disabled={!candidateAlt.trim()}
              onClick={() =>
                replace(
                  {
                    id: newClientId("img"),
                    src: candidate.src,
                    alt: candidateAlt.trim(),
                    meaning: candidate.meaning,
                    source: "library",
                  },
                  "그림을 바꿨어요",
                )
              }
            >
              이 그림으로 바꾸기
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setCandidate(null)}
            >
              취소
            </Button>
          </div>
        </div>
      ) : upload ? (
        <div className="flex flex-col gap-2.5 rounded-xl bg-card p-3 ring-1 ring-hairline">
          <Thumb src={upload.preview} alt={upload.alt} />
          <label className="flex flex-col gap-1">
            <span className="text-2sm font-medium text-muted-foreground">
              대체텍스트 (필수)
            </span>
            <Input
              size="sm"
              value={upload.alt}
              placeholder="그림을 말로 설명해 주세요"
              onChange={(event) =>
                setUpload({ ...upload, alt: event.target.value })
              }
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-2sm font-medium text-muted-foreground">
              의미 설명
            </span>
            <Input
              size="sm"
              value={upload.meaning}
              placeholder="무엇을 나타내는 그림인가요?"
              onChange={(event) =>
                setUpload({ ...upload, meaning: event.target.value })
              }
            />
          </label>
          <div className="flex gap-1.5">
            <Button
              size="sm"
              disabled={!upload.alt.trim() || uploadImage.isPending}
              onClick={() =>
                uploadImage.mutate({
                  file: upload.file,
                  alt: upload.alt.trim(),
                  meaning: upload.meaning.trim(),
                })
              }
            >
              올리고 바꾸기
            </Button>
            <Button size="sm" variant="ghost" onClick={clearUpload}>
              취소
            </Button>
          </div>
        </div>
      ) : browsing ? (
        candidates.isPending ? (
          <ToolLoading label="카드 내용에 맞는 그림을 찾고 있어요" />
        ) : candidates.isError ? (
          <ToolError
            error={candidates.error}
            onRetry={() => candidates.refetch()}
          />
        ) : candidates.data.candidates.length === 0 ? (
          <p className="text-2sm text-muted-foreground">
            아직 고를 수 있는 그림이 없어요. 내 그림을 올리면 여기에 모여요.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-2">
            {candidates.data.candidates.map((item) => (
              <li key={item.src}>
                <button
                  type="button"
                  onClick={() => {
                    setCandidate(item);
                    setCandidateAlt(item.alt);
                  }}
                  className={cn(
                    "flex w-full flex-col gap-1 rounded-xl p-1.5 text-left ring-1 ring-hairline hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none",
                  )}
                >
                  <Thumb src={item.src} alt={item.alt} />
                  <span className="line-clamp-2 text-[12px] leading-snug">
                    {item.meaning}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )
      ) : null}

      {!candidate && !upload && (
        <div className="flex flex-wrap gap-1.5">
          <Button
            size="sm"
            variant={browsing ? "weak" : "secondary"}
            onClick={() => setBrowsing(true)}
          >
            그림 후보 보기
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => fileInput.current?.click()}
          >
            <HugeiconsIcon
              icon={ImageUploadIcon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            내 그림 올리기
          </Button>
          {image && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => replace(null, "그림을 뺐어요")}
            >
              그림 없이
            </Button>
          )}
          <input
            ref={fileInput}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            className="sr-only"
            onChange={(event) => {
              chooseFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </div>
      )}
    </ToolFrame>
  );
}
