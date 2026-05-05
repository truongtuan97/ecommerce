import { Product, Category } from '@repo/product-db';
import z from 'zod';

export type StripeProductType = {
  id: string;
  name: string;
  price: number;
};

export type ProductType = Product;
export type CategoryType = Category;

export type ProductsType = ProductType[];

export const CategoryFormSchema = z.object({
  name: z
    .string({ message: "Name is required!" })
    .min(1, { message: "Name is required!" }),
  slug: z
    .string({ message: "Slug is required!" })
    .min(1, { message: "Slug is required!" })
});