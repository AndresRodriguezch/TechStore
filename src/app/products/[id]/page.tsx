
"use client";

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';

import { db } from '@/lib/firebase';
import { Product } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6">
            <Card>
                <div className="grid md:grid-cols-2 gap-8">
                    <CardHeader>
                        <Skeleton className="w-full h-96 rounded-lg" />
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
      <Card>
        <div className="grid md:grid-cols-2 gap-6 lg:gap-12 items-start">
          <CardHeader className="p-0">
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={800}
              height={800}
              className="w-full h-auto object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
              data-ai-hint="product image"
            />
          </CardHeader>
          <CardContent className="py-6 space-y-4">
            <div>
              <Badge variant="outline" className="mb-2">{product.category}</Badge>
              <CardTitle className="text-3xl lg:text-4xl font-bold">{product.name}</CardTitle>
            </div>
            <p className="text-3xl font-semibold">
                ${product.price.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </p>
            <Separator />
            <CardDescription className="text-base text-muted-foreground">
                {product.description}
            </CardDescription>
            
            <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Disponibilidad:</span> {product.stock > 0 ? `${product.stock} en stock` : 'Agotado'}
            </div>

            <Button size="lg" className="w-full" disabled={product.stock === 0}>
              Añadir al Carrito
            </Button>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}

