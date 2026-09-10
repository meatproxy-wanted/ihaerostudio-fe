"use client";

import * as React from "react";
import {
  columnVisibilityFeature,
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_basic,
  sortFn_text,
  tableFeatures,
  type ColumnVisibilityState,
  type PaginationState,
  type SortingState,
  useTable,
} from "@tanstack/react-table";
import {
  Alert02Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUpDownIcon,
  CheckmarkCircle02Icon,
  CopyIcon,
  Delete01Icon,
  Download02Icon,
  Invoice02Icon,
  Money01Icon,
  MoreHorizontalIcon,
  Refresh01Icon,
  Search02Icon,
  Settings01Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FloatingToolbar,
  FloatingToolbarButton,
  FloatingToolbarLabel,
  FloatingToolbarSeparator,
} from "@/components/ui/floating-toolbar";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trend } from "@/components/ui/trend";
import { ShowcaseCase, ShowcaseSection } from "./showcase-section";

type OrderStatus = "paid" | "pending" | "refunded" | "failed";

type Order = {
  id: string;
  customer: string;
  email: string;
  product: string;
  status: OrderStatus;
  amount: number;
  date: string;
  payment: string;
};

const people = [
  ["김민준", "minjun.kim"],
  ["이서연", "seoyeon.lee"],
  ["박지후", "jihoo.park"],
  ["최하윤", "hayoon.choi"],
  ["정도윤", "doyoon.jung"],
  ["한유진", "yujin.han"],
  ["오시우", "siwoo.oh"],
  ["윤지아", "jia.yoon"],
] as const;

const products = [
  "스마트 건강검진 패키지",
  "프리미엄 유전자 검사",
  "수면 건강 리포트",
  "영양 상담 프로그램",
  "심혈관 집중 검사",
] as const;

const statuses: OrderStatus[] = [
  "paid",
  "paid",
  "pending",
  "refunded",
  "paid",
  "failed",
  "paid",
  "pending",
];

const payments = ["신용카드", "카카오페이", "계좌이체", "네이버페이"] as const;

const orders: Order[] = Array.from({ length: 32 }, (_, index) => {
  const person = people[index % people.length];
  const day = String(4 - Math.floor(index / 8)).padStart(2, "0");

  return {
    id: `ORD-2609-${String(1048 - index).padStart(4, "0")}`,
    customer: person[0],
    email: `${person[1]}${index + 1}@example.com`,
    product: products[index % products.length],
    status: statuses[index % statuses.length],
    amount: 49000 + ((index * 37000) % 320000),
    date: `2026-09-${day}`,
    payment: payments[index % payments.length],
  };
});

const statusLabels: Record<OrderStatus, string> = {
  paid: "결제 완료",
  pending: "결제 대기",
  refunded: "환불",
  failed: "결제 실패",
};

const statusOptions = [
  { label: "모든 상태", value: "all" },
  { label: "결제 완료", value: "paid" },
  { label: "결제 대기", value: "pending" },
  { label: "환불", value: "refunded" },
  { label: "결제 실패", value: "failed" },
] as const;

const columnLabels: Record<string, string> = {
  id: "주문 번호",
  customer: "고객",
  product: "상품",
  status: "상태",
  amount: "결제 금액",
  date: "주문일",
  payment: "결제 수단",
};

const currencyFormatter = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const features = tableFeatures({
  columnVisibilityFeature,
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: {
    basic: sortFn_basic,
    text: sortFn_text,
  },
});

const columnHelper = createColumnHelper<typeof features, Order>();

const columns = columnHelper.columns([
  columnHelper.accessor("id", {
    header: "주문 번호",
    cell: ({ row }) => <span className="font-semibold">{row.original.id}</span>,
    enableHiding: false,
    sortFn: "text",
  }),
  columnHelper.accessor("customer", {
    header: "고객",
    cell: ({ row }) => (
      <div className="flex min-w-44 flex-col">
        <span className="font-semibold">{row.original.customer}</span>
        <span className="text-xs font-medium text-muted-foreground">
          {row.original.email}
        </span>
      </div>
    ),
    sortFn: "text",
  }),
  columnHelper.accessor("product", {
    header: "상품",
    cell: ({ row }) => <span>{row.original.product}</span>,
    sortFn: "text",
  }),
  columnHelper.accessor("status", {
    header: "상태",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
    sortFn: "text",
  }),
  columnHelper.accessor("amount", {
    header: "결제 금액",
    cell: ({ row }) => (
      <span className="font-semibold tabular-nums">
        {currencyFormatter.format(row.original.amount)}
      </span>
    ),
    sortFn: "basic",
  }),
  columnHelper.accessor("date", {
    header: "주문일",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {dateFormatter.format(new Date(`${row.original.date}T00:00:00`))}
      </span>
    ),
    sortFn: "text",
  }),
  columnHelper.accessor("payment", {
    header: "결제 수단",
    sortFn: "text",
  }),
]);

function StatusBadge({ status }: { status: OrderStatus }) {
  const variant =
    status === "failed"
      ? "destructive"
      : status === "paid"
        ? "success"
        : status === "pending"
          ? "warning"
          : "secondary";

  return <Badge variant={variant}>{statusLabels[status]}</Badge>;
}

function SortableHeader({
  label,
  sorted,
  onSort,
}: {
  label: string;
  sorted: false | "asc" | "desc";
  onSort: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="xs"
      className="-ml-2 text-muted-foreground hover:text-foreground"
      onClick={onSort}
    >
      {label}
      <HugeiconsIcon
        icon={ArrowUpDownIcon}
        strokeWidth={2}
        data-icon="inline-end"
      />
      <span className="sr-only">
        {sorted === "asc"
          ? "오름차순 정렬됨"
          : sorted === "desc"
            ? "내림차순 정렬됨"
            : "정렬되지 않음"}
      </span>
    </Button>
  );
}

export function DataTableShowcase() {
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<OrderStatus | "all">("all");
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "date", desc: true },
  ]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 8,
  });
  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({ payment: false });
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(
    () => new Set(),
  );
  const [actionMessage, setActionMessage] = React.useState("");

  const filteredOrders = React.useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("ko-KR");

    return orders.filter((order) => {
      const matchesStatus = status === "all" || order.status === status;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [order.id, order.customer, order.email, order.product].some((value) =>
          value.toLocaleLowerCase("ko-KR").includes(normalizedSearch),
        );

      return matchesStatus && matchesSearch;
    });
  }, [search, status]);

  const table = useTable({
    features,
    data: filteredOrders,
    columns,
    getRowId: (row) => row.id,
    state: {
      sorting,
      pagination,
      columnVisibility,
    },
    onSortingChange: (updater) => {
      setSorting(updater);
      setPagination((previous) => ({ ...previous, pageIndex: 0 }));
    },
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    autoResetPageIndex: false,
  });

  const pageRows = table.getRowModel().rows;
  const pageRowIds = pageRows.map((row) => row.original.id);
  const selectedOnPage = pageRowIds.filter((id) => selectedIds.has(id)).length;
  const allPageRowsSelected =
    pageRowIds.length > 0 && selectedOnPage === pageRowIds.length;
  const somePageRowsSelected =
    selectedOnPage > 0 && selectedOnPage < pageRowIds.length;
  const pageCount = table.getPageCount();
  const totalPaid = orders
    .filter((order) => order.status === "paid")
    .reduce((total, order) => total + order.amount, 0);
  const needsAttention = orders.filter(
    (order) => order.status === "pending" || order.status === "failed",
  ).length;

  function resetFilters() {
    setSearch("");
    setStatus("all");
    setPagination((previous) => ({ ...previous, pageIndex: 0 }));
  }

  function toggleRow(id: string, checked: boolean) {
    setSelectedIds((previous) => {
      const isSelected = previous.has(id);

      if (isSelected === checked) {
        return previous;
      }

      const next = new Set(previous);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  function togglePageRows(checked: boolean) {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      let changed = false;

      for (const id of pageRowIds) {
        if (checked && !next.has(id)) {
          next.add(id);
          changed = true;
        }
        if (!checked && next.delete(id)) {
          changed = true;
        }
      }

      return changed ? next : previous;
    });
  }

  function runBulkAction(label: string) {
    setActionMessage(
      `${selectedIds.size}개 주문에 '${label}' 작업을 실행했습니다.`,
    );
  }

  return (
    <ShowcaseSection
      id="data-table"
      title="Data Table"
      description="검색, 정렬, 필터, 컬럼 설정, 페이지네이션과 안전한 벌크 액션을 한 화면에서 확인합니다."
    >
      <ShowcaseCase
        label="Order management"
        description="32개의 고정 목 데이터로 구성한 관리자용 인터랙티브 테이블"
        className="block px-2 pb-2"
      >
        <div className="flex flex-col gap-5 p-1 sm:p-2">
          <div className="grid gap-3 md:grid-cols-3">
            <Card size="sm">
              <CardHeader>
                <CardDescription className="flex items-center gap-1.5 text-2sm font-semibold">
                  <HugeiconsIcon
                    icon={Invoice02Icon}
                    strokeWidth={2}
                    className="size-4"
                  />
                  전체 주문
                </CardDescription>
              </CardHeader>
              <CardContent className="gap-1">
                <p className="text-2xl font-bold tracking-tight tabular-nums">
                  {orders.length}건
                </p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Trend value={12.5} showIcon />
                  <span>최근 4일 · 지난주 대비</span>
                </div>
              </CardContent>
            </Card>

            <Card size="sm">
              <CardHeader>
                <CardDescription className="flex items-center gap-1.5 text-2sm font-semibold">
                  <HugeiconsIcon
                    icon={Money01Icon}
                    strokeWidth={2}
                    className="size-4"
                  />
                  결제 완료 금액
                </CardDescription>
              </CardHeader>
              <CardContent className="gap-1">
                <p className="text-2xl font-bold tracking-tight tabular-nums">
                  {currencyFormatter.format(totalPaid)}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Trend value={-3.2} showIcon />
                  <span>결제 완료 주문의 합계</span>
                </div>
              </CardContent>
            </Card>

            <Card size="sm">
              <CardHeader>
                <CardDescription className="flex items-center gap-1.5 text-2sm font-semibold">
                  <HugeiconsIcon
                    icon={Alert02Icon}
                    strokeWidth={2}
                    className="size-4"
                  />
                  확인 필요
                </CardDescription>
              </CardHeader>
              <CardContent className="gap-1">
                <p className="text-2xl font-bold tracking-tight tabular-nums">
                  {needsAttention}건
                </p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Badge variant="warning" size="sm">
                    대기 · 실패
                  </Badge>
                  <span>상태의 주문</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <InputGroup className="lg:max-w-sm">
              <InputGroupAddon>
                <HugeiconsIcon icon={Search02Icon} strokeWidth={2} />
              </InputGroupAddon>
              <InputGroupInput
                aria-label="주문 검색"
                placeholder="주문 번호, 고객, 이메일, 상품 검색"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPagination((previous) => ({
                    ...previous,
                    pageIndex: 0,
                  }));
                }}
              />
            </InputGroup>

            <Select
              items={statusOptions}
              value={status}
              onValueChange={(value) => {
                setStatus(value as OrderStatus | "all");
                setPagination((previous) => ({
                  ...previous,
                  pageIndex: 0,
                }));
              }}
            >
              <SelectTrigger
                aria-label="주문 상태 필터"
                size="sm"
                className="w-full sm:w-44"
              >
                <SelectValue placeholder="모든 상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full lg:ml-auto lg:w-auto"
                  />
                }
              >
                <HugeiconsIcon
                  icon={Settings01Icon}
                  strokeWidth={2}
                  data-icon="inline-start"
                />
                컬럼 설정
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>표시할 컬럼</DropdownMenuLabel>
                  {table
                    .getAllLeafColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.getIsVisible()}
                        onCheckedChange={(checked) =>
                          column.toggleVisibility(checked)
                        }
                      >
                        {columnLabels[column.id]}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <FloatingToolbar
            open={selectedIds.size > 0}
            onDismiss={() => setSelectedIds(new Set())}
            aria-label="선택한 주문 작업"
            closeLabel="선택 해제"
            data-testid="bulk-action-bar"
          >
            <FloatingToolbarLabel>
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                strokeWidth={2}
                className="size-4 text-primary-text"
              />
              <span data-testid="selection-count">
                {selectedIds.size}개 주문 선택됨
              </span>
            </FloatingToolbarLabel>
            <FloatingToolbarSeparator />
            <FloatingToolbarButton onClick={() => runBulkAction("내보내기")}>
              <HugeiconsIcon
                icon={Download02Icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              내보내기
            </FloatingToolbarButton>
            <FloatingToolbarButton onClick={() => runBulkAction("상태 변경")}>
              <HugeiconsIcon
                icon={Refresh01Icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              상태 변경
            </FloatingToolbarButton>
            <FloatingToolbarButton
              variant="destructive"
              onClick={() => runBulkAction("삭제")}
            >
              <HugeiconsIcon
                icon={Delete01Icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              삭제
            </FloatingToolbarButton>
          </FloatingToolbar>

          <div className="overflow-hidden rounded-lg">
            <Table className="min-w-4xl">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    <TableHead className="w-12">
                      <Checkbox
                        aria-label="현재 페이지의 주문 전체 선택"
                        data-testid="table-select-all"
                        checked={allPageRowsSelected}
                        indeterminate={somePageRowsSelected}
                        disabled={pageRowIds.length === 0}
                        onCheckedChange={togglePageRows}
                      />
                    </TableHead>
                    {headerGroup.headers.map((header) => {
                      const sorted = header.column.getIsSorted();
                      return (
                        <TableHead
                          key={header.id}
                          aria-sort={
                            sorted === "asc"
                              ? "ascending"
                              : sorted === "desc"
                                ? "descending"
                                : "none"
                          }
                          className={
                            header.column.id === "amount" ? "text-right" : ""
                          }
                        >
                          {header.isPlaceholder ? null : (
                            <SortableHeader
                              label={columnLabels[header.column.id]}
                              sorted={sorted}
                              onSort={() =>
                                header.column.toggleSorting(sorted === "asc")
                              }
                            />
                          )}
                        </TableHead>
                      );
                    })}
                    <TableHead className="w-12 text-right">작업</TableHead>
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {pageRows.length > 0 ? (
                  pageRows.map((row) => {
                    const selected = selectedIds.has(row.original.id);
                    return (
                      <TableRow
                        key={row.original.id}
                        data-state={selected ? "selected" : undefined}
                      >
                        <TableCell>
                          <Checkbox
                            aria-label={`${row.original.id} 주문 선택`}
                            data-testid={`row-select-${row.original.id}`}
                            checked={selected}
                            onCheckedChange={(checked) =>
                              toggleRow(row.original.id, checked)
                            }
                          />
                        </TableCell>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className={
                              cell.column.id === "amount" ? "text-right" : ""
                            }
                          >
                            <table.FlexRender cell={cell} />
                          </TableCell>
                        ))}
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label={`${row.original.id} 작업 메뉴`}
                                />
                              }
                            >
                              <HugeiconsIcon
                                icon={MoreHorizontalIcon}
                                strokeWidth={2}
                              />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuGroup>
                                <DropdownMenuLabel>
                                  {row.original.id}
                                </DropdownMenuLabel>
                                <DropdownMenuItem
                                  className="whitespace-nowrap"
                                  onClick={() =>
                                    setActionMessage(
                                      `${row.original.id} 상세를 열었습니다.`,
                                    )
                                  }
                                >
                                  <HugeiconsIcon
                                    icon={ViewIcon}
                                    strokeWidth={2}
                                  />
                                  주문 상세 보기
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="whitespace-nowrap"
                                  onClick={() =>
                                    setActionMessage(
                                      `${row.original.customer} 고객 정보를 열었습니다.`,
                                    )
                                  }
                                >
                                  <HugeiconsIcon
                                    icon={Invoice02Icon}
                                    strokeWidth={2}
                                  />
                                  고객 정보 보기
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                              <DropdownMenuSeparator />
                              <DropdownMenuGroup>
                                <DropdownMenuItem
                                  className="whitespace-nowrap"
                                  onClick={() => {
                                    void navigator.clipboard
                                      ?.writeText(row.original.id)
                                      .catch(() => undefined);
                                    setActionMessage(
                                      `${row.original.id} 주문 번호를 복사했습니다.`,
                                    );
                                  }}
                                >
                                  <HugeiconsIcon
                                    icon={CopyIcon}
                                    strokeWidth={2}
                                  />
                                  주문 번호 복사
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={table.getVisibleLeafColumns().length + 2}
                      className="p-0"
                    >
                      <Empty>
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <HugeiconsIcon
                              icon={Search02Icon}
                              strokeWidth={2}
                            />
                          </EmptyMedia>
                          <EmptyTitle>조건에 맞는 주문이 없습니다</EmptyTitle>
                          <EmptyDescription>
                            검색어나 상태 필터를 바꿔 다시 확인해 주세요.
                          </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                          <Button variant="secondary" onClick={resetFilters}>
                            <HugeiconsIcon
                              icon={Refresh01Icon}
                              strokeWidth={2}
                              data-icon="inline-start"
                            />
                            필터 초기화
                          </Button>
                        </EmptyContent>
                      </Empty>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 text-2sm font-medium text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              총 {filteredOrders.length}건 · 현재 페이지 {pageRows.length}건
              {selectedIds.size > 0 && ` · ${selectedIds.size}건 선택`}
            </p>
            <div className="flex items-center gap-2">
              <span className="tabular-nums">
                {Math.min(pagination.pageIndex + 1, Math.max(pageCount, 1))} /{" "}
                {Math.max(pageCount, 1)} 페이지
              </span>
              <Button
                variant="secondary"
                size="icon-sm"
                aria-label="이전 페이지"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
              </Button>
              <Button
                variant="secondary"
                size="icon-sm"
                aria-label="다음 페이지"
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
              >
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
              </Button>
            </div>
          </div>

          <p className="sr-only" aria-live="polite">
            {actionMessage}
          </p>
        </div>
      </ShowcaseCase>
    </ShowcaseSection>
  );
}
