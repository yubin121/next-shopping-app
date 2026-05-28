import { prisma } from "@/lib/db";
import { ProductGrid } from "@/components/products/ProductGrid";

interface HomePageProps {
  searchParams: Promise<{ category?: string }>;
}

const PROMO_BANNERS = [
  {
    label: "신상품",
    title: "이번 주\n신상 도착!",
    sub: "최신 트렌드를 가장 먼저",
    category: null,
    href: "/",
    bg: "from-violet-500 to-purple-700",
    emoji: "✨",
  },
  {
    label: "베스트",
    title: "무료배송\n혜택 상품",
    sub: "3만원 이상 무료배송",
    category: null,
    href: "/?freeShipping=true",
    bg: "from-rose-400 to-pink-600",
    emoji: "🚀",
  },
  {
    label: "카테고리",
    title: "패션 &\n액세서리",
    sub: "상의·하의·가방·신발",
    category: "상의",
    href: "/?category=%EC%83%81%EC%9D%98",
    bg: "from-sky-400 to-blue-600",
    emoji: "👗",
  },
];

export default async function HomePage({ searchParams }: HomePageProps) {
  const { category } = await searchParams;

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      select: { category: true },
      distinct: ["category"],
      where: { category: { not: null } },
    }),
  ]);

  const categoryList = categories
    .map((p) => p.category)
    .filter(Boolean) as string[];

  return (
    <div>
      {/* 프로모션 배너 카드 3장 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {PROMO_BANNERS.map((banner) => (
          <a
            key={banner.label}
            href={banner.href}
            className={`relative bg-gradient-to-br ${banner.bg} rounded-2xl p-6 text-white overflow-hidden group hover:shadow-lg transition-shadow`}
          >
            {/* 배경 장식 원 */}
            <div className="absolute -right-6 -top-6 w-28 h-28 bg-white/10 rounded-full" />
            <div className="absolute -right-2 -bottom-8 w-20 h-20 bg-white/10 rounded-full" />

            {/* 라벨 뱃지 */}
            <span className="inline-block text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full mb-3">
              {banner.label}
            </span>

            {/* 이모지 */}
            <div className="text-4xl mb-3">{banner.emoji}</div>

            {/* 타이틀 */}
            <h2 className="text-xl font-extrabold leading-snug whitespace-pre-line mb-1">
              {banner.title}
            </h2>

            {/* 서브 문구 */}
            <p className="text-sm text-white/80">{banner.sub}</p>

            {/* 바로가기 */}
            <div className="mt-4 text-xs font-semibold text-white/90 group-hover:translate-x-1 transition-transform">
              바로가기 →
            </div>
          </a>
        ))}
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <a
          href="/"
          className={`px-4 py-2 rounded-full text-sm border transition-colors ${
            !category
              ? "bg-gray-900 text-white border-gray-900"
              : "bg-white text-gray-600 border-gray-300 hover:border-gray-500"
          }`}
        >
          전체
        </a>
        {categoryList.map((cat) => (
          <a
            key={cat}
            href={`/?category=${encodeURIComponent(cat)}`}
            className={`px-4 py-2 rounded-full text-sm border transition-colors ${
              category === cat
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-300 hover:border-gray-500"
            }`}
          >
            {cat}
          </a>
        ))}
      </div>

      {/* 섹션 타이틀 */}
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">
          {category ? `'${category}' 상품` : "전체 상품"}
        </h2>
        <span className="text-sm text-gray-400">{products.length}개</span>
      </div>

      {/* 상품 목록 */}
      <ProductGrid products={products} />
    </div>
  );
}
