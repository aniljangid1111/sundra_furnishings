export const instant = false;

import { notFound } from "next/navigation";
import { ProductForm } from "@/features/products/product-form";
import { products } from "@/features/products/product.data";

interface EditProductPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function EditProductPage({
    params,
}: EditProductPageProps) {
    const { id } = await params;

    const product = products.find((item) => item.id === Number(id));

    if (!product) {
        notFound();
    }

    return <ProductForm mode="edit" product={product} />;
}