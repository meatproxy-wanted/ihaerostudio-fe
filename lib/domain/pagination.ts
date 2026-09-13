export interface PrintBlock {
  id: string;
  /** Measured height in the same unit as the page height. */
  height: number;
  /** Always begins a new page (covers, sections). */
  startsPage?: boolean;
  /** Never ends a page (headings stay with what follows). */
  keepWithNext?: boolean;
}

/**
 * Packs measured blocks into pages. Blocks are never split; a block taller
 * than a page gets a page to itself. The result drives both the on-screen
 * preview and printing, so their page counts match.
 */
export function paginate(
  blocks: PrintBlock[],
  { pageHeight, gap }: { pageHeight: number; gap: number },
): string[][] {
  const pages: string[][] = [];
  let page: string[] = [];
  let used = 0;

  const flush = () => {
    if (page.length > 0) pages.push(page);
    page = [];
    used = 0;
  };

  blocks.forEach((block, index) => {
    if (block.startsPage) flush();

    let needed = block.height;
    if (
      block.keepWithNext &&
      blocks[index + 1] &&
      !blocks[index + 1].startsPage
    ) {
      needed += gap + blocks[index + 1].height;
    }
    const extra = page.length > 0 ? gap : 0;

    if (page.length > 0 && used + extra + needed > pageHeight) flush();

    page.push(block.id);
    used += (page.length > 1 ? gap : 0) + block.height;

    if (block.height > pageHeight) flush();
  });
  flush();
  return pages;
}
