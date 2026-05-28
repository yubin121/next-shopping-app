import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { productSchema } from "@/schemas/product.schema";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = productSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "입력값이 올바르지 않습니다", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { name, price, stock, category, description, imageUrl } = parsed.data;

  const product = await prisma.product.create({
    data: {
      name,
      price,
      stock,
      category: category || null,
      description: description || null,
      imageUrl: imageUrl || null,
    },
  });

  return NextResponse.json(product, { status: 201 });
}

export async function GET() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}
