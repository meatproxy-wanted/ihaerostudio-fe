import Link from "next/link";

import { AppShell } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { routes } from "@/lib/routes";

export default function NotFound() {
  return (
    <AppShell>
      <Empty className="flex-1">
        <EmptyHeader>
          <p className="text-4xl font-bold tracking-tight text-muted-foreground">
            404
          </p>
          <EmptyTitle className="text-lg">페이지를 찾을 수 없어요</EmptyTitle>
          <EmptyDescription>
            주소가 바뀌었거나 지워진 자료일 수 있어요.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            nativeButton={false}
            render={<Link href={routes.materials()} />}
          >
            작업함으로
          </Button>
        </EmptyContent>
      </Empty>
    </AppShell>
  );
}
