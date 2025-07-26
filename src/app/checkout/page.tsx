"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Banknote, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CreditCardForm from "@/components/credit-card-form";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, total, clearCart } = useCart();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);

  if (cart.length === 0) {
    return (
      <Card className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm min-h-[calc(100vh-8rem)]">
        <div className="flex flex-col items-center gap-2 text-center p-8">
          <h3 className="text-2xl font-bold tracking-tight">
            No hay nada para pagar
          </h3>
          <p className="text-muted-foreground max-w-md">
            Tu carrito está vacío. Añade productos antes de proceder al pago.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/products">Explorar Productos</Link>
          </Button>
        </div>
      </Card>
    );
  }
  
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (user) {
        try {
            const issueDate = new Date();
            const dueDate = new Date();
            dueDate.setDate(issueDate.getDate() + 30);

            await addDoc(collection(db, "invoices"), {
                invoiceNumber: `INV-${Date.now()}`,
                customerId: user.uid,
                issueDate: issueDate.toISOString().split('T')[0], // YYYY-MM-DD
                dueDate: dueDate.toISOString().split('T')[0], // YYYY-MM-DD
                items: cart.map(item => ({
                    id: item.id,
                    description: item.name,
                    quantity: item.quantity,
                    price: item.price,
                })),
                taxRate: 0.19, // Example tax rate
                discount: 0,
                status: 'Pagada',
            });
            
            toast({
              title: "¡Pago Exitoso!",
              description: "Tu pedido ha sido procesado y se ha generado la factura.",
            });

            clearCart();
            router.push("/");

        } catch (error) {
             console.error("Error creating invoice: ", error);
             toast({
                title: "Error",
                description: "Ocurrió un error al generar tu factura.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    } else {
        toast({
            title: "Error de Autenticación",
            description: "Debes iniciar sesión para completar la compra.",
            variant: "destructive",
        });
        setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
       <div className="mb-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver al carrito
        </Button>
      </div>
      <form onSubmit={handlePayment}>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Método de Pago</CardTitle>
                <CardDescription>Selecciona cómo quieres pagar tu pedido.</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid gap-4">
                  <Label htmlFor="card" className="flex items-center gap-4 rounded-md border p-4 hover:bg-accent cursor-pointer has-[[data-state=checked]]:border-primary">
                    <RadioGroupItem value="card" id="card" />
                    <CreditCard className="h-6 w-6" />
                    <span className="font-medium">Tarjeta de crédito/débito</span>
                  </Label>
                  <Label htmlFor="pse" className="flex items-center gap-4 rounded-md border p-4 hover:bg-accent cursor-pointer has-[[data-state=checked]]:border-primary">
                    <RadioGroupItem value="pse" id="pse" />
                    <Banknote className="h-6 w-6" />
                    <span className="font-medium">PSE (Banca en línea)</span>
                  </Label>
                </RadioGroup>

                {paymentMethod === 'card' && (
                  <div className="mt-6">
                    <CreditCardForm disabled={loading} />
                  </div>
                )}
                 {paymentMethod === 'pse' && (
                  <div className="mt-6 text-center">
                    <p className="text-muted-foreground mb-4">Serás redirigido a la plataforma de PSE para completar tu pago de forma segura.</p>
                    <Button variant="outline" className="w-full" disabled={loading}>Continuar con PSE</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                 {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                        <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                        </div>
                        <p className="font-medium">{(item.price * item.quantity).toLocaleString("es-CO", { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</p>
                    </div>
                 ))}
                 <Separator />
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
                  <span>Total a Pagar</span>
                  <span>{total.toLocaleString("es-CO", { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</span>
                </div>
              </CardContent>
              <CardFooter>
                 <Button type="submit" className="w-full" size="lg" disabled={loading || !user}>
                    {loading ? 'Procesando Pago...' : `Pagar ${total.toLocaleString("es-CO", { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}`}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
