"use client";
import React, { useEffect, useState } from "react";
import { Product } from "../../types/product";
import ProductCard from "../../components/ProductCard";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/products.json");
        if (!response.ok) throw new Error("Failed to fetch products.");
        const data: Product[] = await response.json();
        if (isMounted) {
          setProducts(data);
          setLoading(false);

          // Fire-and-forget analytics API call after successful product load
          (async () => {
            try {
              await fetch("/api/analytics", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ event: "products_page_visit" }),
              });
            } catch {
              // Silently ignore analytics errors
            }
          })();
        }
      } catch (err: any) {
        if (isMounted) {
          setError("Error loading products. Please try again.");
          setLoading(false);
        }
      }
    }

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1>Product Showcase</h1>
      {loading && <p>Loading products...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
