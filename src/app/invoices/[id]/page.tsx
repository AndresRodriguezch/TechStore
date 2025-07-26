import { notFound } from "next/navigation";
import { format } from "date-fns";
import { invoices, customers } from "@/lib/data";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { InvoiceActions } from "@/components/invoice-actions";
import InvoiceStatusBadge from "@/components/invoice-status-badge";
import { Gem } from "lucide-react";

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const invoice = invoices.find((inv) => inv.id === params.id);
  if (!invoice) {
    notFound();
  }

  const customer = customers.find((c) => c.id === invoice.customerId);
  if (!customer) {
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
              <h1 className="text-3xl font-bold text-primary">Invoice</h1>
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
              <h3 className="font-semibold mb-1">Bill To:</h3>
              <p className="font-medium">{customer.name}</p>
              <p className="text-sm text-muted-foreground">{customer.address.street}</p>
              <p className="text-sm text-muted-foreground">{customer.address.city}, {customer.address.state} {customer.address.zip}</p>
              <p className="text-sm text-muted-foreground">{customer.email}</p>
            </div>
            <div className="text-right">
              <div className="grid grid-cols-2 gap-y-1">
                <span className="font-semibold">Issue Date:</span>
                <span>{format(new Date(invoice.issueDate), 'PPP')}</span>
                <span className="font-semibold">Due Date:</span>
                <span>{format(new Date(invoice.dueDate), 'PPP')}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/2">Description</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.description}</TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${(item.quantity * item.price).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Separator className="my-6" />
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax ({ (invoice.taxRate * 100).toFixed(0) }%)</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span>-${invoice.discount.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
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
