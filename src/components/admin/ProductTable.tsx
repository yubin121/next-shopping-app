"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ProductFormModal } from "./ProductFormModal";

interface Product {
  id: string;
  name: string;
  category: string | null;
  price: number;
  stock: number;
  description: string | null;
  imageUrl: string | null;
  createdAt: string;
}

type ModalState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; product: Product };

async function fetchAdminProducts(): Promise<Product[]> {
  const response = await fetch("/api/admin/products");
  if (!response.ok) throw new Error("상품 목록을 불러오는 데 실패했습니다");
  return response.json();
}

export function ProductTable() {
  const [modal, setModal] = useState<ModalState>({ mode: "closed" });

  const { data: products, isLoading, isError } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: fetchAdminProducts,
  });

  const closeModal = () => setModal({ mode: "closed" });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-16 text-red-500">
        상품 목록을 불러오지 못했습니다.
      </div>
    );
  }

  return (
    <div>
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">상품 관리</h1>
        <Button onClick={() => setModal({ mode: "create" })}>+ 상품 등록</Button>
      </div>

      {/* 안내 문구 */}
      {products && products.length > 0 && (
        <p className="text-xs text-gray-400 mb-3">
          행을 클릭하면 해당 상품을 수정할 수 있습니다.
        </p>
      )}

      {/* 상품 목록 테이블 */}
      {products && products.length > 0 ? (
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left px-4 py-3 font-medium">상품명</th>
                <th className="text-left px-4 py-3 font-medium">카테고리</th>
                <th className="text-right px-4 py-3 font-medium">가격</th>
                <th className="text-right px-4 py-3 font-medium">재고</th>
                <th className="text-left px-4 py-3 font-medium">등록일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr
                  key={product.id}
                  onClick={() => setModal({ mode: "edit", product })}
                  className="hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {product.category ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900">
                    {product.price.toLocaleString("ko-KR")}원
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`font-medium ${
                        product.stock === 0 ? "text-red-500" : "text-gray-900"
                      }`}
                    >
                      {product.stock}개
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {new Date(product.createdAt).toLocaleDateString("ko-KR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg mb-4">등록된 상품이 없습니다</p>
          <Button onClick={() => setModal({ mode: "create" })}>
            첫 상품 등록하기
          </Button>
        </div>
      )}

      {/* 모달 */}
      {modal.mode === "create" && <ProductFormModal onClose={closeModal} />}
      {modal.mode === "edit" && (
        <ProductFormModal onClose={closeModal} product={modal.product} />
      )}
    </div>
  );
}
