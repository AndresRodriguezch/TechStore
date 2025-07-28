"use client";

import { useEffect, useState } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';

import { db } from '@/lib/firebase';
import { Product } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!params.id) return;

    const fetchProduct = async () => {
      try {
        const productRef = doc(db, 'products', params.id);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          setProduct({ id: productSnap.id, ...productSnap.data() } as Product);
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

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

  if (loading) {
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6">
             <Skeleton className="h-10 w-32 mb-4" />
            <Card>
                <div className="grid md:grid-cols-2 gap-8">
                    <CardHeader>
                        <Skeleton className="w-full h-64 md:h-96 rounded-lg" />
                    </CardHeader>
                    <CardContent className="py-6 space-y-6">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/5" />
                        <Separator />
                        <Skeleton className="h-10 w-1/2" />
                        <Skeleton className="h-12 w-full" />
                    </CardContent>
                </div>
            </Card>
      </div>
    );
  }

  if (!product) {
    return notFound();
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="mb-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
      </div>
      <Card className="overflow-hidden">
        <div className="grid md:grid-cols-2 md:gap-6 lg:gap-12 items-center">
          <CardHeader className="p-0">
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={800}
              height={800}
              className="w-full h-auto max-h-[300px] md:max-h-[500px] object-contain"
              data-ai-hint="product image"
            />
          </CardHeader>
          <CardContent className="p-4 md:p-6 space-y-4">
            <div>
              <Badge variant="outline" className="mb-2">{product.category}</Badge>
              <CardTitle className="text-2xl md:text-3xl lg:text-4xl font-bold">{product.name}</CardTitle>
            </div>
            <p className="text-2xl md:text-3xl font-semibold">
                {product.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
            </p>
            <Separator />
            <CardDescription className="text-base text-muted-foreground">
                {product.description}
            </CardDescription>
            
            <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Disponibilidad:</span> {product.stock > 0 ? `${product.stock} en stock` : 'Agotado'}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button size="lg" className="flex-1 text-base sm:text-sm py-6 sm:py-2" onClick={() => handleAddToCart(product)} disabled={product.stock === 0}>
                Añadir al Carrito
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
      
      {user?.role === 'admin' && (
        <div className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-2">
          <Button variant="outline" asChild>
            <Link href={`/products/${product.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar Producto
            </Link>
          </Button>
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar Producto
          </Button>
        </div>
      )}
    </div>
  );
}
