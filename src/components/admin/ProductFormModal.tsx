"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productSchema, ProductFormData } from "@/schemas/product.schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  category: string | null;
  price: number;
  stock: number;
  description?: string | null;
  imageUrl?: string | null;
}

interface ProductFormModalProps {
  onClose: () => void;
  product?: Product; // 전달 시 수정 모드, 미전달 시 등록 모드
}

async function createProduct(data: ProductFormData) {
  const response = await fetch("/api/admin/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "상품 등록에 실패했습니다");
  }
  return response.json();
}

async function updateProduct({ id, data }: { id: string; data: ProductFormData }) {
  const response = await fetch(`/api/admin/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "상품 수정에 실패했습니다");
  }
  return response.json();
}

export function ProductFormModal({ onClose, product }: ProductFormModalProps) {
  const isEditMode = !!product;
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(product?.imageUrl ?? null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: isEditMode
      ? {
          name: product.name,
          price: product.price,
          stock: product.stock,
          category: product.category ?? "",
          description: (product as any).description ?? "",
          imageUrl: product.imageUrl ?? "",
        }
      : undefined,
  });

  const mutation = useMutation({
    mutationFn: isEditMode
      ? (data: ProductFormData) => updateProduct({ id: product.id, data })
      : createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      onClose();
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 미리보기
    setPreview(URL.createObjectURL(file));

    // 업로드
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "업로드 실패");
      }

      const { url } = await response.json();
      setValue("imageUrl", url); // imageUrl 필드에 자동 입력
    } catch (err) {
      alert((err as Error).message);
      setPreview(product?.imageUrl ?? null);
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = (data: ProductFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">
            {isEditMode ? "상품 수정" : "상품 등록"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 상품명 */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              상품명 <span className="text-red-500">*</span>
            </label>
            <Input {...register("name")} placeholder="상품명을 입력하세요" />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* 가격 / 재고 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                가격 (원) <span className="text-red-500">*</span>
              </label>
              <Input
                {...register("price", { valueAsNumber: true })}
                type="number"
                placeholder="10000"
                min={1}
              />
              {errors.price && (
                <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                재고 (개) <span className="text-red-500">*</span>
              </label>
              <Input
                {...register("stock", { valueAsNumber: true })}
                type="number"
                placeholder="100"
                min={0}
              />
              {errors.stock && (
                <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>
              )}
            </div>
          </div>

          {/* 카테고리 */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              카테고리
            </label>
            <Input {...register("category")} placeholder="예: 상의, 하의, 신발" />
          </div>

          {/* 설명 */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              상품 설명
            </label>
            <Input {...register("description")} placeholder="간단한 상품 설명" />
          </div>

          {/* 이미지 업로드 */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              상품 이미지
            </label>

            {/* 미리보기 */}
            {preview && (
              <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                <Image
                  src={preview}
                  alt="이미지 미리보기"
                  fill
                  className="object-cover"
                  sizes="400px"
                  unoptimized={preview.startsWith("blob:")}
                />
              </div>
            )}

            {/* 파일 선택 버튼 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full mb-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? "업로드 중..." : "📁 로컬 파일 선택"}
            </Button>

            {/* URL 직접 입력 */}
            <Input
              {...register("imageUrl")}
              placeholder="또는 이미지 URL 직접 입력"
              onChange={(e) => {
                register("imageUrl").onChange(e);
                setPreview(e.target.value || null);
              }}
            />
            {errors.imageUrl && (
              <p className="text-red-500 text-xs mt-1">{errors.imageUrl.message}</p>
            )}
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={mutation.isPending || isUploading}
            >
              {mutation.isPending
                ? "처리 중..."
                : isEditMode
                  ? "수정"
                  : "등록"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
