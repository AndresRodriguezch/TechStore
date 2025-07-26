"use client";

import { notFound, useParams } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { InvoiceActions } from "@/components/invoice-actions";
import InvoiceStatusBadge from "@/components/invoice-status-badge";
import { Gem } from "lucide-react";
import { db } from "@/lib/firebase";
import { Invoice, Customer } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;

    const fetchInvoice = async () => {
      try {
        const invoiceRef = doc(db, "invoices", params.id);
        const invoiceSnap = await getDoc(invoiceRef);

        if (invoiceSnap.exists()) {
          const invoiceData = { id: invoiceSnap.id, ...invoiceSnap.data() } as Invoice;
          setInvoice(invoiceData);

          const userRef = doc(db, "users", invoiceData.customerId);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setCustomer({ id: userSnap.id, ...userSnap.data() } as Customer);
          } else {
            console.error("No such customer (user)!");
          }
        } else {
          console.error("No such invoice!");
        }
      } catch (error) {
        console.error("Error fetching document: ", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvoice();
  }, [params.id]);

  if (loading) {
    return (
       <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="p-6 bg-muted/50">
             <Skeleton className="h-8 w-1/4" />
             <Skeleton className="h-4 w-1/5 mt-2" />
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-36" />
              </div>
              <div className="text-right space-y-2">
                <Skeleton className="h-4 w-48 ml-auto" />
                <Skeleton className="h-4 w-48 ml-auto" />
              </div>
            </div>
            <Skeleton className="w-full h-40" />
            <div className="flex justify-end">
              <div className="w-full max-w-xs space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-8 w-full mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!invoice || !customer) {
    notFound();
  }

  const subtotal = invoice.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
  const taxAmount = subtotal * invoice.taxRate;
  const total = subtotal + taxAmount - invoice.discount;

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="print:shadow-none print:border-none">
        <CardHeader className="p-6 bg-muted/50 print:bg-transparent">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-primary">Factura</h1>
              <p className="text-muted-foreground">{invoice.invoiceNumber}</p>
              <div className="mt-2">
                <InvoiceStatusBadge status={invoice.status} />
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-2 text-xl font-semibold">
                <Gem className="h-6 w-6 text-primary" /> E-commerce Inc.
              </div>
              <p className="text-sm text-muted-foreground">123 Business Rd, Suite 456</p>
              <p className="text-sm text-muted-foreground">Commerce City, ST 78910</p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-1">Facturar a:</h3>
              <p className="font-medium">{customer.name}</p>
              {customer.address && (
                <>
                <p className="text-sm text-muted-foreground">{customer.address.street}</p>
                <p className="text-sm text-muted-foreground">{customer.address.city}, {customer.address.country}</p>
                </>
              )}
              <p className="text-sm text-muted-foreground">{customer.email}</p>
            </div>
            <div className="text-right">
              <div className="grid grid-cols-2 gap-y-1">
                <span className="font-semibold">Fecha de Emisión:</span>
                <span>{format(new Date(invoice.issueDate), 'PPP', { locale: es })}</span>
                <span className="font-semibold">Fecha de Vencimiento:</span>
                <span>{format(new Date(invoice.dueDate), 'PPP', { locale: es })}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/2">Descripción</TableHead>
                <TableHead className="text-center">Cantidad</TableHead>
                <TableHead className="text-right">Precio Unitario</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.description}</TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right">{item.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</TableCell>
                  <TableCell className="text-right">{(item.quantity * item.price).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Separator className="my-6" />
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{subtotal.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Impuesto ({ (invoice.taxRate * 100).toFixed(0) }%)</span>
                <span>{taxAmount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Descuento</span>
                  <span>-{invoice.discount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{total.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="mt-6 flex justify-center gap-2 print:hidden">
          <InvoiceActions />
      </div>
    </div>
  );
}
