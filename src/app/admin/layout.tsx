import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/");
  }

  return (
    <div>
      <div className="mb-6 border-b pb-4">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          관리자 백오피스
        </h2>
      </div>
      {children}
    </div>
  );
}
