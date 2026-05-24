import { z } from "zod";

export const ListProductsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: z.string().optional(),
  search: z.string().optional(),
});

export type ListProductsInput = z.infer<typeof ListProductsSchema>;
