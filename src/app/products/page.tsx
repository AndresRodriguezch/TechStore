"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product } from "@/lib/types";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { PlusCircle } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { user } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const allCategories = products.map((product) => product.category);
    return ['all', ...Array.from(new Set(allCategories))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, searchTerm, selectedCategory]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
            <h1 className="text-4xl font-bold tracking-tight">Todos los Productos</h1>
            <p className="text-muted-foreground mt-2">
            Explora nuestro catálogo completo de productos tecnológicos.
            </p>
        </div>
        {user?.role === 'admin' && (
             <Button asChild className="gap-1 w-full sm:w-auto">
                <Link href="/products/new">
                <PlusCircle className="h-4 w-4" />
                <span>Crear Producto</span>
                </Link>
            </Button>
        )}
      </header>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          type="text"
          placeholder="Buscar productos por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar por categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category === 'all' ? 'Todas las Categorías' : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="flex flex-col overflow-hidden">
              <CardHeader className="p-0">
                <Skeleton className="w-full h-48" />
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-full mt-1" />
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))
        ) : (
          filteredProducts.map((product) => (
            <Card key={product.id} className="flex flex-col overflow-hidden">
              <CardHeader className="p-0">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                  data-ai-hint="product image"
                />
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <CardTitle className="text-lg font-semibold mb-1">{product.name}</CardTitle>
                <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                <p className="text-sm text-muted-foreground line-clamp-3">{product.description}</p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex flex-col items-start gap-4 mt-auto">
                <div className="flex justify-between items-center w-full">
                  <p className="text-2xl font-bold">
                    ${product.price.toLocaleString("es-ES", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <Button className="w-full">Añadir al Carrito</Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
      {!loading && filteredProducts.length === 0 && (
         <div className="text-center col-span-full py-12">
            <p className="text-muted-foreground">No se encontraron productos que coincidan con tu búsqueda.</p>
        </div>
      )}
    </div>
  );
}
