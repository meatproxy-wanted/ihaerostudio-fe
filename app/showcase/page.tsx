import { redirect } from "next/navigation";

/**
 * 토스 기준 전체 컴포넌트 목록은 이 서비스와 의미가 맞지 않아 걷어냈다.
 * 예전 주소로 들어온 사람을 실제로 쓰는 것만 모은 쪽으로 보낸다.
 */
export default function ShowcaseIndexPage() {
  redirect("/showcase/service");
}
