"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useDefaultLayout, usePanelRef } from "react-resizable-panels";
import { useStore } from "zustand";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, SidebarLeftIcon } from "@hugeicons/core-free-icons";

import { ErrorState } from "@/components/app/error-state";
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
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useSearchParamsSync } from "@/hooks/use-search-params-sync";
import { api } from "@/lib/api/client";
import {
  cacheProject,
  useDocumentQuery,
  useSource,
  useStructureQuery,
} from "@/lib/api/hooks";
import { queryKeys } from "@/lib/api/query-keys";
import type { EasyDocument } from "@/lib/domain/document";
import type { Project } from "@/lib/domain/project";
import { readerContextFor } from "@/lib/domain/reader-content";
import type { SourceDocument } from "@/lib/domain/source";
import type { CaseStructure } from "@/lib/domain/structure";
import { parseEditorTool, routes, type EditorTool } from "@/lib/routes";
import { useAutosave } from "@/lib/stores/autosave";

import { EditorCanvas } from "./editor-canvas";
import { EditorReaderContext } from "./editor-context";
import { EditorSource } from "./editor-source";
import {
  createEditorStore,
  EditorStoreContext,
  type EditorSelection,
  type EditorStore,
} from "./editor-store";
import { EditorToolbar } from "./editor-toolbar";
import { OutdatedDraftBanner } from "./outdated-banner";
import { ToolPanel } from "./tool-panel";
import { useEditorKeyboard } from "./use-editor-keyboard";

export function EditorScreen() {
  const project = useCurrentProject();
  const searchParams = useSearchParams();
  const source = useSource(project.id);
  const structure = useStructureQuery(project.id);
  const document = useDocumentQuery(project.id);
  const [generation, setGeneration] = useState(0);
  const fromReview = searchParams.get("from") === "review";

  const [initialSelection] = useState<EditorSelection>(() => {
    const sentence = searchParams.get("sentence");
    const card = searchParams.get("card");
    if (sentence) return { type: "sentence", id: sentence };
    if (card) return { type: "card", id: card };
    return null;
  });
  const [initialTool] = useState(() =>
    parseEditorTool(searchParams.get("tool")),
  );

  if (source.isPending || structure.isPending || document.isPending) {
    return <PanesSkeleton panes={3} />;
  }
  const error = source.error ?? structure.error ?? document.error;
  if (error || !source.data || !structure.data || !document.data) {
    return (
      <ErrorState
        title="편집할 자료를 불러오지 못했어요"
        error={error}
        onRetry={() => {
          void source.refetch();
          void structure.refetch();
          void document.refetch();
        }}
      />
    );
  }

  return (
    <EditorWorkspace
      key={`${project.id}:${generation}`}
      project={project}
      fromReview={fromReview}
      onRegenerated={() => setGeneration((value) => value + 1)}
      source={source.data}
      structure={structure.data}
      initialDocument={document.data}
      initialSelection={generation === 0 ? initialSelection : null}
      initialTool={generation === 0 ? initialTool : null}
    />
  );
}

function useSelectionInUrl(store: EditorStore) {
  const selection = useStore(store, (state) => state.selection);
  const tool = useStore(store, (state) => state.tool);
  useSearchParamsSync({
    sentence: selection?.type === "sentence" ? selection.id : null,
    card: selection?.type === "card" ? selection.id : null,
    tool: selection && tool ? tool : null,
  });
}

/** Below 1280px the source pane starts folded so the canvas keeps its room. */
const NARROW_EDITOR = "(max-width: 1279px)";

function EditorWorkspace({
  project,
  fromReview,
  onRegenerated,
  source,
  structure,
  initialDocument,
  initialSelection,
  initialTool,
}: {
  project: Project;
  fromReview: boolean;
  onRegenerated: () => void;
  source: SourceDocument;
  structure: CaseStructure;
  initialDocument: EasyDocument;
  initialSelection: EditorSelection;
  initialTool: EditorTool | null;
}) {
  const queryClient = useQueryClient();
  const [store] = useState(() => {
    const created = createEditorStore(initialDocument, initialSelection);
    const usable =
      initialTool !== "image" || project.settings.illustrations === "with";
    if (initialSelection && initialTool && usable) {
      created.getState().openTool(initialTool);
    }
    return created;
  });
  const [sourceCollapsed, setSourceCollapsed] = useState(false);
  const sourcePanel = usePanelRef();
  const layout = useDefaultLayout({
    id: "editor-panes",
    panelIds: ["source", "canvas", "tools"],
  });
  useSelectionInUrl(store);
  useEditorKeyboard(store);

  // Fold the source when the window gets narrow and unfold it when it widens
  // again; a wide window on arrival keeps the producer's saved layout.
  const narrow = useMediaQuery(NARROW_EDITOR);
  const wasNarrow = useRef<boolean | null>(null);
  useEffect(() => {
    const previous = wasNarrow.current;
    wasNarrow.current = narrow;
    if (narrow === (previous ?? false)) return;
    if (narrow) sourcePanel.current?.collapse();
    else sourcePanel.current?.expand();
  }, [narrow, sourcePanel]);

  const autosave = useAutosave({
    store,
    save: async (value) => {
      const result = await api.document.save(project.id, value);
      queryClient.setQueryData(queryKeys.document(project.id), result.document);
      cacheProject(queryClient, result.project);
      return result.document;
    },
  });
  useSaveFailureToast(autosave.saveStatus, () => void autosave.flush());

  const context = useMemo(
    () => readerContextFor(project.settings, structure.overview),
    [structure.overview, project.settings],
  );

  return (
    <EditorStoreContext value={store}>
      <EditorReaderContext value={context}>
        <SourceTextProvider source={source}>
          <ShellActions>
            <EditorToolbar />
            {fromReview && (
              <Button
                size="sm"
                variant="secondary"
                nativeButton={false}
                render={<Link href={routes.step(project.id, "review")} />}
              >
                검토로 돌아가기
              </Button>
            )}
            <SaveIndicator
              status={autosave.saveStatus}
              dirty={autosave.dirty}
              onRetry={() => void autosave.flush()}
            />
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href={routes.step(project.id, "review")} />}
            >
              검토하기
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                strokeWidth={2}
                data-icon="inline-end"
              />
            </Button>
          </ShellActions>

          <div className="flex h-full flex-col">
            <OutdatedDraftBanner
              project={project}
              flush={autosave.flush}
              onRegenerated={onRegenerated}
            />
            <div className="min-h-0 flex-1">
              <ResizablePanelGroup
                orientation="horizontal"
                defaultLayout={layout.defaultLayout}
                onLayoutChanged={layout.onLayoutChanged}
              >
                <ResizablePanel
                  id="source"
                  panelRef={sourcePanel}
                  defaultSize="30"
                  minSize="18"
                  collapsible
                  collapsedSize="0"
                  onResize={(size) =>
                    setSourceCollapsed(size.asPercentage === 0)
                  }
                >
                  <EditorSource source={source} />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel id="canvas" defaultSize="44" minSize="30">
                  <EditorCanvas
                    context={context}
                    leading={
                      <Button
                        variant="secondary"
                        size="xs"
                        aria-expanded={!sourceCollapsed}
                        onClick={() =>
                          sourceCollapsed
                            ? sourcePanel.current?.expand()
                            : sourcePanel.current?.collapse()
                        }
                      >
                        <HugeiconsIcon
                          icon={SidebarLeftIcon}
                          strokeWidth={2}
                          data-icon="inline-start"
                        />
                        {sourceCollapsed ? "원문 펼치기" : "원문 접기"}
                      </Button>
                    }
                  />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel id="tools" defaultSize="26" minSize={320}>
                  <ToolPanel />
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </div>
        </SourceTextProvider>
      </EditorReaderContext>
    </EditorStoreContext>
  );
}
