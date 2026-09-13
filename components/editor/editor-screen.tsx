"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useDefaultLayout, usePanelRef } from "react-resizable-panels";
import { useStore } from "zustand";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, SidebarLeftIcon } from "@hugeicons/core-free-icons";

import { ErrorState } from "@/components/app/error-state";
import { PanesSkeleton } from "@/components/app/panes-skeleton";
import { SaveIndicator } from "@/components/app/save-indicator";
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
import type { ReaderContext } from "@/lib/domain/reader-content";
import type { SourceDocument } from "@/lib/domain/source";
import type { CaseStructure } from "@/lib/domain/structure";
import { routes } from "@/lib/routes";
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
import { ToolPanel } from "./tool-panel";
import { useEditorKeyboard } from "./use-editor-keyboard";

export function EditorScreen() {
  const project = useCurrentProject();
  const searchParams = useSearchParams();
  const source = useSource(project.id);
  const structure = useStructureQuery(project.id);
  const document = useDocumentQuery(project.id);

  const [initialSelection] = useState<EditorSelection>(() => {
    const sentence = searchParams.get("sentence");
    const card = searchParams.get("card");
    if (sentence) return { type: "sentence", id: sentence };
    if (card) return { type: "card", id: card };
    return null;
  });

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
      key={project.id}
      project={project}
      source={source.data}
      structure={structure.data}
      initialDocument={document.data}
      initialSelection={initialSelection}
    />
  );
}

function useSelectionInUrl(store: EditorStore) {
  const selection = useStore(store, (state) => state.selection);
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("sentence");
    url.searchParams.delete("card");
    if (selection) url.searchParams.set(selection.type, selection.id);
    window.history.replaceState(null, "", url);
  }, [selection]);
}

function EditorWorkspace({
  project,
  source,
  structure,
  initialDocument,
  initialSelection,
}: {
  project: Project;
  source: SourceDocument;
  structure: CaseStructure;
  initialDocument: EasyDocument;
  initialSelection: EditorSelection;
}) {
  const queryClient = useQueryClient();
  const [store] = useState(() =>
    createEditorStore(initialDocument, initialSelection),
  );
  const [sourceCollapsed, setSourceCollapsed] = useState(false);
  const sourcePanel = usePanelRef();
  const layout = useDefaultLayout({
    id: "editor-panes",
    panelIds: ["source", "canvas", "tools"],
  });
  useSelectionInUrl(store);
  useEditorKeyboard(store);

  const autosave = useAutosave({
    store,
    save: async (value) => {
      const result = await api.document.save(project.id, value);
      cacheProject(queryClient, result.project);
      queryClient.setQueryData(queryKeys.document(project.id), result.document);
      return result.document;
    },
  });

  const context = useMemo<ReaderContext>(
    () => ({
      overview: structure.overview,
      tone: project.settings.tone,
      illustrations: project.settings.illustrations,
    }),
    [structure.overview, project.settings],
  );

  return (
    <EditorStoreContext value={store}>
      <EditorReaderContext value={context}>
        <SourceTextProvider source={source}>
          <ShellActions>
            <EditorToolbar />
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
              onResize={(size) => setSourceCollapsed(size.asPercentage === 0)}
            >
              <EditorSource source={source} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel id="canvas" defaultSize="44" minSize="30">
              <div className="relative h-full">
                <Button
                  variant="secondary"
                  size="xs"
                  className="absolute top-3 left-3 z-10"
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
                <EditorCanvas context={context} />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel id="tools" defaultSize="26" minSize={320}>
              <ToolPanel />
            </ResizablePanel>
          </ResizablePanelGroup>
        </SourceTextProvider>
      </EditorReaderContext>
    </EditorStoreContext>
  );
}
