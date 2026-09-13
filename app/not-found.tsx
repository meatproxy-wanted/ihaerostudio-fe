import Link from "next/link";

import { AppHeader } from "@/components/app/app-header";
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
    <div className="flex min-h-svh flex-col bg-background">
      <AppHeader />
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
          <Button nativeButton={false} render={<Link href={routes.home()} />}>
            작업함으로
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
