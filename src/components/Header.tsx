import Link from "next/link";
import { auth } from "@/lib/auth"; // lib/auth.ts에서 NextAuth의 auth 함수를 가져옵니다. 이 함수는 현재 사용자의 세션 정보를 서버에서 가져오는 역할을 합니다. Header 컴포넌트에서는 이 함수를 사용하여 로그인 상태에 따라 다른 UI를 렌더링합니다. 예를 들어, 사용자가 로그인한 경우에는 사용자 이름과 마이페이지 링크, 로그아웃 버튼을 보여주고, 로그인하지 않은 경우에는 로그인 및 회원가입 링크를 보여줍니다.
import { SignOutButton } from "./SignOutButton";
import { CartBadge } from "./CartBadge"; // ← 이 줄을 추가합니다

export async function Header() {
  const session = await auth();// 서버에서 세션 정보를 가져옵니다. 이 함수는 현재 사용자의 인증 상태와 정보를 반환합니다. 반환된 session 객체는 사용자가 로그인했는지 여부, 사용자 정보(예: 이름, 이메일, 역할 등)를 포함합니다. Header 컴포넌트에서는 이 session 정보를 사용하여 로그인 상태에 따라 다른 UI를 렌더링합니다. 예를 들어, 사용자가 로그인한 경우에는 사용자 이름과 마이페이지 링크, 로그아웃 버튼을 보여주고, 로그인하지 않은 경우에는 로그인 및 회원가입 링크를 보여줍니다.

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="text-xl font-bold text-gray-900">
          🛍️ ShopApp
        </Link>

        {/* 네비게이션 */}
        <nav className="flex items-center gap-6">
          <Link
            href="/products"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            상품 목록
          </Link>
          <CartBadge userId={session?.user?.id} />{" "}
          {/* 장바구니 배지를 여기에 추가합니다 */}
          {session?.user?.role === "admin" && (
            <Link
              href="/admin"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              관리자
            </Link>
          )}
        </nav>

        {/* 인증 영역 */}
        <div className="flex items-center gap-3">
          {session ? (
            <>
              <span className="text-sm text-gray-600">
                {session.user?.name} 님
              </span>
              <Link
                href="/mypage"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                마이페이지
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                로그인
              </Link>
              <Link
                href="/register"
                className="text-sm bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
