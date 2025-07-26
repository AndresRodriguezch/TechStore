import Link from "next/link";
import { ArrowUpRight, Users, CreditCard } from "lucide-react";
import { format } from "date-fns";

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
    .filter((invoice) => invoice.status === 'Paid')
    .reduce((acc, invoice) => {
      const subtotal = invoice.items.reduce((s, item) => s + item.price * item.quantity, 0);
      const taxAmount = subtotal * invoice.taxRate;
      const total = subtotal + taxAmount - invoice.discount;
      return acc + total;
    }, 0);

  const pendingAmount = invoices
    .filter((invoice) => invoice.status === 'Pending' || invoice.status === 'Overdue')
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
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <span className="text-muted-foreground">💵</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{customers.length}</div>
            <p className="text-xs text-muted-foreground">All-time customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Across all pending invoices</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>An overview of the most recent invoices.</CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/invoices">
                View All
                <ArrowUpRight className="h-4 w-4" />
                </Link>
            </Button>
        </CardHeader>
        <CardContent className="!pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden sm:table-cell">Invoice #</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden md:table-cell">Issue Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
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
                    <TableCell className="hidden md:table-cell">{format(new Date(invoice.issueDate), 'PPP')}</TableCell>
                    <TableCell className="text-right">${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
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
