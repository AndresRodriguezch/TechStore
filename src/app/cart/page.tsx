"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/cart-context";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, total, clearCart } = useCart();

  if (cart.length === 0) {
    return (
      <Card className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm min-h-[calc(100vh-8rem)]">
        <div className="flex flex-col items-center gap-2 text-center p-8">
          <h3 className="text-2xl font-bold tracking-tight">
            Tu carrito de compras está vacío
          </h3>
          <p className="text-muted-foreground max-w-md">
            Parece que aún no has añadido nada. ¡Explora nuestros productos!
          </p>
          <Button className="mt-4" asChild>
            <Link href="/products">Explorar Productos</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Carrito de Compras ({cart.reduce((acc, item) => acc + item.quantity, 0)} items)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="rounded-md object-contain border p-1"
                  />
                  <div className="flex-grow grid gap-1">
                    <Link href={`/products/${item.id}`} className="font-semibold hover:underline">
                      {item.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {item.price.toLocaleString("es-CO", { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      min="1"
                      max={item.stock}
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value, 10))}
                      className="w-20 text-center"
                    />
                     <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} aria-label="Remove item">
                        <Trash2 className="h-5 w-5 text-muted-foreground" />
                    </Button>
                  </div>
                  <div className="text-right font-semibold w-24">
                     {(item.price * item.quantity).toLocaleString("es-CO", { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
           <CardFooter className="p-4 flex justify-end">
              <Button variant="outline" onClick={clearCart}>
                Vaciar Carrito
              </Button>
            </CardFooter>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Resumen del Pedido</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{total.toLocaleString("es-CO", { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between">
              <span>Envío</span>
              <span>Gratis</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{total.toLocaleString("es-CO", { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/checkout">Proceder al Pago</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
