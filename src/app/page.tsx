import Link from "next/link";
import { ArrowUpRight, Users, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { invoices, customers } from "@/lib/data";
import InvoiceStatusBadge from "@/components/invoice-status-badge";

function getCustomerById(id: string) {
  return customers.find((customer) => customer.id === id);
}

export default function Home() {
  const totalRevenue = invoices
    .filter((invoice) => invoice.status === 'Pagada')
    .reduce((acc, invoice) => {
      const subtotal = invoice.items.reduce((s, item) => s + item.price * item.quantity, 0);
      const taxAmount = subtotal * invoice.taxRate;
      const total = subtotal + taxAmount - invoice.discount;
      return acc + total;
    }, 0);

  const pendingAmount = invoices
    .filter((invoice) => invoice.status === 'Pendiente' || invoice.status === 'Vencida')
    .reduce((acc, invoice) => {
        const subtotal = invoice.items.reduce((s, item) => s + item.price * item.quantity, 0);
        const taxAmount = subtotal * invoice.taxRate;
        const total = subtotal + taxAmount - invoice.discount;
        return acc + total;
    }, 0);


  const recentInvoices = invoices.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()).slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <span className="text-muted-foreground">💵</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">+20.1% del último mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{customers.length}</div>
            <p className="text-xs text-muted-foreground">Clientes de todo el tiempo</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturas Pendientes</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingAmount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">En todas las facturas pendientes</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
                <CardTitle>Facturas Recientes</CardTitle>
                <CardDescription>Un resumen de las facturas más recientes.</CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/invoices">
                Ver Todas
                <ArrowUpRight className="h-4 w-4" />
                </Link>
            </Button>
        </CardHeader>
        <CardContent className="!pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden sm:table-cell">Factura #</TableHead>
                <TableHead className="hidden sm:table-cell">Estado</TableHead>
                <TableHead className="hidden md:table-cell">Fecha de Emisión</TableHead>
                <TableHead className="text-right">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentInvoices.map((invoice) => {
                const customer = getCustomerById(invoice.customerId);
                const subtotal = invoice.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
                const taxAmount = subtotal * invoice.taxRate;
                const total = subtotal + taxAmount - invoice.discount;
                return (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <Link href={`/invoices/${invoice.id}`} className="font-medium hover:underline block truncate">
                        {customer?.name}
                      </Link>
                      <div className="block text-muted-foreground sm:hidden">{invoice.invoiceNumber}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Link href={`/invoices/${invoice.id}`} className="hover:underline">
                        {invoice.invoiceNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <InvoiceStatusBadge status={invoice.status} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{format(new Date(invoice.issueDate), 'PPP', { locale: es })}</TableCell>
                    <TableCell className="text-right">${total.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
