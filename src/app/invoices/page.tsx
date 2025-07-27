"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MoreHorizontal, ListFilter } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import InvoiceStatusBadge from "@/components/invoice-status-badge";
import { db } from "@/lib/firebase";
import { Invoice, Customer } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function InvoicesPage() {
  const searchParams = useSearchParams();
  const customerId = searchParams.get('customerId');

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [users, setUsers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invoicesSnapshot, usersSnapshot] = await Promise.all([
          getDocs(collection(db, "invoices")),
          getDocs(collection(db, "users")),
        ]);
        const invoicesData = invoicesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Invoice));
        const usersData = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Customer));
        setInvoices(invoicesData);
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getUserById = (id: string) => {
    return users.find((user) => user.id === id);
  }

  const filteredInvoices = useMemo(() => {
    if (!customerId) return invoices;
    return invoices.filter(invoice => invoice.customerId === customerId);
  }, [invoices, customerId]);
  
  const customerName = useMemo(() => {
    if (!customerId) return null;
    return getUserById(customerId)?.name;
  }, [users, customerId]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>{customerName ? `Facturas de ${customerName}` : 'Facturas'}</CardTitle>
            <CardDescription>
               {customerName ? `Un resumen de todas las facturas de ${customerName}.` : 'Gestiona tus facturas y sigue su estado.'}
            </CardDescription>
          </div>
           {customerId && (
            <Button asChild variant="outline">
              <Link href="/invoices">
                <ListFilter className="mr-2 h-4 w-4" /> Ver Todas las Facturas
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Factura #</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="hidden md:table-cell">Fecha de Vencimiento</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                 <TableRow key={index}>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded-full ml-auto" /></TableCell>
                  </TableRow>
              ))
            ) : filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice) => {
                const user = getUserById(invoice.customerId);
                const subtotal = invoice.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
                const taxAmount = subtotal * invoice.taxRate;
                const total = subtotal + taxAmount - invoice.discount;

                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      <Link href={`/invoices/${invoice.id}`} className="hover:underline">
                        {invoice.invoiceNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{user?.name}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {format(new Date(invoice.dueDate), "PPP", { locale: es })}
                    </TableCell>
                    <TableCell>
                      <InvoiceStatusBadge status={invoice.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {total.toLocaleString("es-CO", { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem asChild><Link href={`/invoices/${invoice.id}`}>Ver Detalles</Link></DropdownMenuItem>
                          <DropdownMenuItem>Marcar como Pagada</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive">Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
                 <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                        No se encontraron facturas.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
