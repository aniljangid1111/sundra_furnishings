import { notFound } from "next/navigation";

import { CategoryForm } from "@/features/categories/category-form";
import { categories } from "@/features/categories/category.data";

interface EditCategoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  const { id } = await params;

  const category = categories.find(
    (item) => item.id === Number(id),
  );

  if (!category) {
    notFound();
  }

  return (
    <CategoryForm
      mode="edit"
      category={category}
    />
  );
}