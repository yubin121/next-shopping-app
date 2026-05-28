import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "상품명은 2자 이상 입력해주세요"),
  price: z
    .number()
    .int("가격은 정수로 입력해주세요")
    .min(1, "가격은 1원 이상이어야 합니다"),
  stock: z
    .number()
    .int("재고는 정수로 입력해주세요")
    .min(0, "재고는 0개 이상이어야 합니다"),
  category: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z
    .string()
    .refine(
      (val) => val === "" || val.startsWith("/") || z.string().url().safeParse(val).success,
      "올바른 URL 형식이 아닙니다",
    )
    .optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;
