"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useDefaultLayout } from "react-resizable-panels";
import { useStore } from "zustand";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

import { ErrorState } from "@/components/app/error-state";
import { LongJobLoader, useLongJob } from "@/components/app/long-job";
import { PanesSkeleton } from "@/components/app/panes-skeleton";
import {
  SaveIndicator,
  useSaveFailureToast,
} from "@/components/app/save-indicator";
import {
  ShellActions,
  useCurrentProject,
} from "@/components/project-shell/project-context";
import { SourceTextProvider } from "@/components/source-viewer/source-text";
import {
  SourceViewer,
  type SourceMark,
} from "@/components/source-viewer/source-viewer";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { api } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import {
  cacheProject,
  useDocumentQuery,
  useSource,
  useStructureQuery,
} from "@/lib/api/hooks";
import { queryKeys } from "@/lib/api/query-keys";
import { countTouchedSentences } from "@/lib/domain/document-ops";
import type { Project } from "@/lib/domain/project";
import type { SourceDocument } from "@/lib/domain/source";
import type { CaseStructure } from "@/lib/domain/structure";
import {
  addAnchor,
  type ItemRef,
  type StructureList,
} from "@/lib/domain/structure-ops";
import { routes } from "@/lib/routes";
import { useAutosave } from "@/lib/stores/autosave";

import { DRAFT_STEPS } from "./draft-steps";
import { DraftFooter } from "./draft-footer";
import { itemElementId } from "./item-shell";
import { SettingsDialog } from "./settings-dialog";
import { StructurePanel } from "./structure-panel";
import {
  createStructureStore,
  StructureStoreContext,
  type StructureStore,
} from "./structure-store";

const LISTS: StructureList[] = [
  "parties",
  "keyFacts",
  "claims",
  "findings",
  "decisions",
];

function refForId(structure: CaseStructure, id: string): ItemRef | null {
  for (const list of LISTS) {
    if (structure[list].some((item) => item.id === id)) return { list, id };
  }
  return null;
}

export function StructureScreen() {
  const project = useCurrentProject();
  const source = useSource(project.id);
  const structure = useStructureQuery(project.id);
  const [editorKey, setEditorKey] = useState(0);

  if (source.isPending || structure.isPending) return <PanesSkeleton />;
  if (source.isError || structure.isError) {
    return (
      <ErrorState
        title="사건 구조를 불러오지 못했어요"
        error={source.error ?? structure.error}
        onRetry={() => {
          void source.refetch();
          void structure.refetch();
        }}
      />
    );
  }

  return (
    <StructureEditor
      key={`${project.id}-${editorKey}`}
      project={project}
      source={source.data}
      initial={structure.data}
      onStructureReplaced={() => setEditorKey((key) => key + 1)}
    />
  );
}

function StructureEditor({
  project,
  source,
  initial,
  onStructureReplaced,
}: {
  project: Project;
  source: SourceDocument;
  initial: CaseStructure;
  onStructureReplaced: () => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [store] = useState(() => createStructureStore(initial));
  const document = useDocumentQuery(project.id, project.document !== null);
  const layout = useDefaultLayout({
    id: "structure-panes",
    panelIds: ["source", "structure"],
  });

  const autosave = useAutosave({
    store,
    save: async (value) => {
      const result = await api.structure.save(project.id, value);
      cacheProject(queryClient, result.project);
      queryClient.setQueryData(
        queryKeys.structure(project.id),
        result.structure,
      );
      return result.structure;
    },
  });
  useSaveFailureToast(autosave.saveStatus, () => void autosave.flush());

  const draft = useLongJob({
    run: async (_input: void, signal) => {
      await autosave.flush();
      if (store.getState().saveStatus === "error") {
        throw new ApiError(
          "failed",
          "사건 구조를 저장하지 못해서 초안을 만들 수 없어요. 저장을 다시 시도해 주세요.",
        );
      }
      return api.document.generate(project.id, { signal });
    },
    onSuccess: (result) => {
      queryClient.setQueryData(queryKeys.document(project.id), result.document);
      cacheProject(queryClient, result.project);
      queryClient.removeQueries({ queryKey: queryKeys.review(project.id) });
      router.push(routes.step(project.id, "edit"));
    },
  });

  const hasDraft = project.document !== null;

  return (
    <StructureStoreContext value={store}>
      <SourceTextProvider source={source}>
        <ShellActions>
          <SaveIndicator
            status={autosave.saveStatus}
            dirty={autosave.dirty}
            onRetry={() => void autosave.flush()}
          />
          {hasDraft && (
            <Button
              size="sm"
              variant="secondary"
              nativeButton={false}
              render={<Link href={routes.step(project.id, "edit")} />}
            >
              편집으로
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                strokeWidth={2}
                data-icon="inline-end"
              />
            </Button>
          )}
        </ShellActions>

        <ResizablePanelGroup
          orientation="horizontal"
          defaultLayout={layout.defaultLayout}
          onLayoutChanged={layout.onLayoutChanged}
        >
          <ResizablePanel id="source" defaultSize="42" minSize="25">
            <StructureSource source={source} store={store} />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel id="structure" defaultSize="58" minSize="35">
            <StructurePanel
              hasDraft={hasDraft}
              settingsButton={
                <SettingsDialog
                  project={project}
                  disabled={autosave.dirty || autosave.saveStatus === "saving"}
                  onSaved={(namingChanged) => {
                    if (!namingChanged) return;
                    void queryClient
                      .invalidateQueries({
                        queryKey: queryKeys.structure(project.id),
                      })
                      .then(onStructureReplaced);
                  }}
                />
              }
              footer={
                <DraftFooter
                  hasDraft={hasDraft}
                  touchedSentences={
                    document.data ? countTouchedSentences(document.data) : null
                  }
                  busy={draft.phase !== "idle"}
                  onGenerate={() => void draft.start()}
                />
              }
            />
          </ResizablePanel>
        </ResizablePanelGroup>

        <DraftError error={draft.error} onRetry={() => void draft.start()} />
        <LongJobLoader
          job={draft}
          title="초안을 만들고 있어요"
          steps={DRAFT_STEPS}
        />
      </SourceTextProvider>
    </StructureStoreContext>
  );
}

function DraftError({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  if (error === null) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center">
      <div
        role="alert"
        className="pointer-events-auto flex items-center gap-3 rounded-xl bg-popover px-4 py-3 text-sm shadow-popover ring-1 ring-destructive/40"
      >
        <span className="text-destructive">
          {error instanceof ApiError
            ? error.message
            : "초안을 만들지 못했어요."}
        </span>
        <Button size="sm" variant="secondary" onClick={onRetry}>
          다시 시도
        </Button>
      </div>
    </div>
  );
}

function StructureSource({
  source,
  store,
}: {
  source: SourceDocument;
  store: StructureStore;
}) {
  const structure = useStore(store, (state) => state.value);
  const selected = useStore(store, (state) => state.selected);

  const marks = useMemo<SourceMark[]>(
    () =>
      LISTS.flatMap((list) =>
        structure[list].flatMap((item) =>
          item.anchors.map((anchor) => ({ key: item.id, anchor })),
        ),
      ),
    [structure],
  );

  return (
    <SourceViewer
      source={source}
      marks={marks}
      activeKeys={selected ? [selected.id] : []}
      onMarkClick={(keys) => {
        const ref = refForId(store.getState().value, keys[0]);
        if (!ref) return;
        store.getState().select(ref);
        document
          .getElementById(itemElementId(ref.id))
          ?.scrollIntoView({ block: "center", behavior: "smooth" });
      }}
      selectionLabel={selected ? "선택한 항목의 근거로 추가" : undefined}
      onSelectionAction={(anchor) => {
        const current = store.getState().selected;
        if (!current) return;
        store.getState().apply((value) => addAnchor(value, current, anchor));
      }}
    />
  );
}
