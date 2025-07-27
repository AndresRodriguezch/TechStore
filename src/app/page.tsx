"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/types";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, "products"), limit(3));
        const querySnapshot = await getDocs(q);
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

  const handleAddToCart = (product: Product) => {
    if (!isAuthenticated) {
      toast({
        title: "Inicia Sesión",
        description: "Debes iniciar sesión para añadir productos al carrito.",
        variant: "destructive",
      });
      return;
    }
    addToCart(product);
    toast({
      title: "¡Producto añadido!",
      description: `${product.name} ha sido añadido a tu carrito.`,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Bienvenido a E-commerce</h1>
        <p className="text-muted-foreground mt-2">
          Explora nuestra selección de los mejores productos tecnológicos.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
             <Card key={index} className="flex flex-col overflow-hidden">
              <CardHeader className="p-4 flex justify-center items-center">
                <Skeleton className="w-full h-40" />
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-full mt-1" />
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))
        ) : (
          products.map((product) => (
            <Card key={product.id} className="flex flex-col overflow-hidden">
              <CardHeader className="p-4 flex justify-center items-center h-48">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  width={600}
                  height={400}
                  className="w-full h-full object-contain p-2"
                  data-ai-hint="product image"
                />
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <CardTitle className="text-lg font-semibold mb-1 line-clamp-1">{product.name}</CardTitle>
                <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                 <p className="text-2xl font-bold">
                    {product.price.toLocaleString("es-CO", { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
                  </p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex flex-col gap-2">
                 <Button className="w-full" onClick={() => handleAddToCart(product)} disabled={product.stock === 0}>Añadir al Carrito</Button>
                 <Button variant="outline" className="w-full" asChild>
                  <Link href={`/products/${product.id}`}>Ver Detalles</Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
       <div className="text-center">
          <Button asChild>
            <Link href="/products">Ver Todos los Productos</Link>
          </Button>
        </div>
    </div>
  );
}
