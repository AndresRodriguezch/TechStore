
"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlusCircle, MoreHorizontal, Eye, EyeOff, ChevronLeft, ChevronRight } from "lucide-react";
import { doc, updateDoc, setDoc, getDocs, collection } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";


import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { auth, db } from "@/lib/firebase";
import { Customer } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

function AccessDenied() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Acceso Denegado</CardTitle>
        <CardDescription>
          No tienes los permisos necesarios para ver esta página.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Por favor, contacta a un administrador si crees que esto es un error.</p>
      </CardContent>
    </Card>
  )
}

export default function CustomersPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // State for Edit Role Dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const customersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
        setCustomers(customersData);
    } catch (error) {
      console.error("Error fetching customers: ", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes. Revisa los permisos de la base de datos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!authLoading && user?.role !== 'admin') {
      return;
    }
    
    if (user) {
      fetchCustomers();
    }
  }, [user, authLoading, fetchCustomers]);

  const handleOpenEditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    setNewRole(customer.role || 'user');
    setIsEditDialogOpen(true);
  };
  
  const handleRoleChange = async () => {
    if (!editingCustomer) return;

    try {
      const userDocRef = doc(db, "users", editingCustomer.id);
      await updateDoc(userDocRef, { role: newRole }); 
      toast({
        title: "¡Rol actualizado!",
        description: `El rol de ${editingCustomer.name} ha sido cambiado a ${newRole}.`,
      });
      setIsEditDialogOpen(false);
      setEditingCustomer(null);
      fetchCustomers(); 
    } catch (error) {
      console.error("Error updating role: ", error);
       toast({
        title: "Error",
        description: "No se pudo actualizar el rol del cliente.",
        variant: "destructive",
      });
    }
  };

  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return customers.slice(startIndex, endIndex);
  }, [customers, currentPage]);

  const totalPages = Math.ceil(customers.length / ITEMS_PER_PAGE);


  if (authLoading) {
    return <p>Cargando...</p>;
  }

  if (!user || user.role !== 'admin') {
    return <AccessDenied />;
  }

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Clientes</CardTitle>
            <CardDescription>
              Gestiona tus clientes y mira sus detalles.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead className="hidden sm:table-cell">Rol</TableHead>
              <TableHead className="hidden md:table-cell">Correo Electrónico</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : paginatedCustomers.length > 0 ? (
                paginatedCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell className="hidden sm:table-cell capitalize">{customer.role}</TableCell>
                <TableCell className="hidden md:table-cell">{customer.email}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>
                   {customer.email !== 'andres.rodriguez@pi.edu.co' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => handleOpenEditDialog(customer)}>Editar Rol</DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/invoices?customerId=${customer.id}`}>Ver Facturas</Link>
                          </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))
            ) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        No se encontraron clientes.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
       <CardFooter>
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
          <div className="flex-1">
            Mostrando <strong>{Math.min(paginatedCustomers.length, ITEMS_PER_PAGE * currentPage)}</strong> de <strong>{customers.length}</strong> clientes.
          </div>
           <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Anterior</span>
            </Button>
            <span className="font-medium">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
               <span className="hidden sm:inline">Siguiente</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>

    {/* Edit Role Dialog */}
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Rol de Usuario</DialogTitle>
          <DialogDescription>
            Cambia el rol de {editingCustomer?.name}. Solo el rol puede ser modificado.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-name" className="text-right">Nombre</Label>
            <Input id="edit-name" value={editingCustomer?.name ?? ''} readOnly className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-email" className="text-right">Correo</Label>
            <Input id="edit-email" value={editingCustomer?.email ?? ''} readOnly className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">Rol</Label>
             <Select onValueChange={(value: 'admin' | 'user') => setNewRole(value)} defaultValue={editingCustomer?.role ?? 'user'}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleRoleChange}>Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    
    </>
  );
}
