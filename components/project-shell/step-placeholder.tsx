import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

/** Temporary body for steps whose screens land in later commits. */
export function StepPlaceholder({ title }: { title: string }) {
  return (
    <Empty className="h-full">
      <EmptyHeader>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>이 화면은 곧 만들어져요.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
