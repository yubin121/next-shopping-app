import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "파일이 없습니다" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "jpg, png, webp 형식만 업로드 가능합니다" },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "파일 크기는 5MB 이하여야 합니다" },
      { status: 400 },
    );
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const savePath = path.join(process.cwd(), "public", "images", "products", filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(savePath, buffer);

  return NextResponse.json({ url: `/images/products/${filename}` }, { status: 201 });
}
