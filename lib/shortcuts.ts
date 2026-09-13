/** Whether keys are going into a text field rather than to the screen. */
export function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

/**
 * Screen shortcuts stay out of the way while typing, when another handler
 * already used the key, and inside dialogs, menus, and lists that own their
 * keys.
 */
export function shouldIgnoreShortcut(event: KeyboardEvent): boolean {
  const { target } = event;
  return (
    event.defaultPrevented ||
    isTypingTarget(target) ||
    (target instanceof HTMLElement &&
      target.closest(
        "[role=dialog],[role=alertdialog],[role=menu],[role=listbox]",
      ) !== null)
  );
}
