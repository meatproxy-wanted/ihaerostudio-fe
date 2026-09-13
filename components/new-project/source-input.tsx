"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  FileUploadIcon,
  Pdf01Icon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { isPdfFile, SOURCE_LIMITS } from "@/lib/domain/source";
import { cn } from "@/lib/utils";

export type SourceTab = "pdf" | "text";

export interface SourceDraft {
  tab: SourceTab;
  file: File | null;
  text: string;
}

export function sourceProblem(source: SourceDraft): string | null {
  if (source.tab === "pdf") {
    if (!source.file) return "판결문 PDF를 올려 주세요.";
    if (!isPdfFile(source.file)) return "PDF 파일만 올릴 수 있어요.";
    if (source.file.size > SOURCE_LIMITS.pdfMaxBytes) {
      return "20MB 이하의 PDF만 올릴 수 있어요.";
    }
    return null;
  }
  const length = source.text.trim().length;
  if (length === 0) return "판결문 텍스트를 붙여 넣어 주세요.";
  if (length < SOURCE_LIMITS.textMinLength) {
    return `텍스트가 너무 짧아요. ${SOURCE_LIMITS.textMinLength}자 이상 넣어 주세요.`;
  }
  if (length > SOURCE_LIMITS.textMaxLength) {
    return "10만 자 이하로 붙여 넣어 주세요.";
  }
  return null;
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  return `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

export function SourceInput({
  value,
  onChange,
  showErrors,
}: {
  value: SourceDraft;
  onChange: (value: SourceDraft) => void;
  showErrors: boolean;
}) {
  const problem = sourceProblem(value);
  const showProblem =
    problem !== null &&
    (showErrors ||
      (value.tab === "pdf" && value.file !== null) ||
      (value.tab === "text" && value.text.length > 0));

  return (
    <Tabs
      value={value.tab}
      onValueChange={(tab) => onChange({ ...value, tab: tab as SourceTab })}
    >
      <TabsList size="lg" className="w-full sm:w-fit">
        <TabsTrigger value="pdf">PDF 올리기</TabsTrigger>
        <TabsTrigger value="text">텍스트 붙여넣기</TabsTrigger>
      </TabsList>
      <TabsContent value="pdf">
        <PdfDropzone
          file={value.file}
          onFile={(file) => onChange({ ...value, file })}
          invalid={showProblem}
        />
      </TabsContent>
      <TabsContent value="text">
        <TextSource
          text={value.text}
          onText={(text) => onChange({ ...value, text })}
          invalid={showProblem}
        />
      </TabsContent>
      {showProblem && (
        <p role="alert" className="text-2sm font-medium text-destructive">
          {problem}
        </p>
      )}
    </Tabs>
  );
}

function PdfDropzone({
  file,
  onFile,
  invalid,
}: {
  file: File | null;
  onFile: (file: File | null) => void;
  invalid: boolean;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    const dropped = event.dataTransfer.files[0];
    if (dropped) onFile(dropped);
  }

  if (file) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl bg-card p-4 ring-1 ring-hairline",
          invalid && "ring-destructive",
        )}
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
          <HugeiconsIcon icon={Pdf01Icon} strokeWidth={1.8} size={22} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-semibold">{file.name}</span>
          <span className="text-2sm text-muted-foreground">
            {formatBytes(file.size)}
          </span>
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onFile(null);
            if (inputRef.current) inputRef.current.value = "";
          }}
        >
          <HugeiconsIcon
            icon={Cancel01Icon}
            strokeWidth={2}
            data-icon="inline-start"
          />
          빼기
        </Button>
      </div>
    );
  }

  return (
    <label
      htmlFor={inputId}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-input bg-card px-6 py-12 text-center transition-colors hover:border-primary/60 has-focus-visible:border-primary",
        dragging && "border-primary bg-primary/5",
        invalid && "border-destructive",
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <HugeiconsIcon icon={FileUploadIcon} strokeWidth={1.8} size={24} />
      </span>
      <span className="flex flex-col gap-1">
        <span className="text-md font-semibold">
          PDF를 끌어다 놓거나 눌러서 고르세요
        </span>
        <span className="text-2sm text-muted-foreground">
          글자를 선택할 수 있는 PDF가 좋아요. 스캔본은 분석이 어려울 수 있어요.
          (20MB까지)
        </span>
      </span>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        onChange={(event) => onFile(event.target.files?.[0] ?? null)}
      />
    </label>
  );
}

function TextSource({
  text,
  onText,
  invalid,
}: {
  text: string;
  onText: (text: string) => void;
  invalid: boolean;
}) {
  const count = text.trim().length;
  return (
    <div className="flex flex-col gap-1.5">
      <Textarea
        value={text}
        onChange={(event) => onText(event.target.value)}
        aria-label="판결문 텍스트"
        aria-invalid={invalid || undefined}
        placeholder="판결문 전체를 붙여 넣어 주세요. 주문, 청구취지, 이유가 모두 들어가면 좋아요."
        className="field-sizing-fixed h-64 resize-y text-md leading-relaxed"
      />
      <p className="self-end text-2sm text-muted-foreground tabular-nums">
        {count.toLocaleString("ko-KR")}자
        {count < SOURCE_LIMITS.textMinLength &&
          ` · 최소 ${SOURCE_LIMITS.textMinLength}자`}
      </p>
    </div>
  );
}
