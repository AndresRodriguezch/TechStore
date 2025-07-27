
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";


import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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

// Component for the Add Customer Form
const AddCustomerForm = ({ onCustomerAdded, closeDialog }: { onCustomerAdded: () => void, closeDialog: () => void }) => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

     if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        phone: phone,
        address: {
          street: address,
          city: city,
          country: country,
        },
        role: 'user' // New customers are always 'user'
      });
      
      toast({
        title: "¡Cliente Añadido!",
        description: "El nuevo cliente ha sido creado exitosamente.",
      });

      onCustomerAdded(); // Refresh customer list
      closeDialog(); // Close the dialog

    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        setError('Este correo electrónico ya está en uso.');
      } else {
        setError('Ocurrió un error al crear el cliente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleAddCustomer}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">Nombre</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="email" className="text-right">Correo</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="password" className="text-right">Contraseña</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="phone" className="text-right">Teléfono</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="address" className="text-right">Dirección</Label>
          <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="city" className="text-right">Ciudad</Label>
          <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required className="col-span-3" />
        </div>
         <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="country" className="text-right">País</Label>
          <Input id="country" value={country} onChange={(e) => setCountry(e.target.value)} required className="col-span-3" />
        </div>
         {error && <p className="col-span-4 text-sm text-center text-destructive">{error}</p>}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={closeDialog} type="button">Cancelar</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar Cliente'}</Button>
      </DialogFooter>
    </form>
  )
}


export default function CustomersPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // State for Add Customer Dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // State for Edit Role Dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');

  // State for Delete Confirmation Dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);


  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const customersData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Customer));
      setCustomers(customersData);
    } catch (error) {
      console.error("Error fetching customers: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.role !== 'admin') {
      return;
    }
    
    if (user) {
      fetchCustomers();
    }
  }, [user, authLoading]);

  const handleOpenEditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    setNewRole(customer.role || 'user');
    setIsEditDialogOpen(true);
  };
  
  const handleOpenDeleteDialog = (customer: Customer) => {
    setDeletingCustomer(customer);
    setIsDeleteDialogOpen(true);
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

  const handleDeleteCustomer = async () => {
    if (!deletingCustomer) return;

    try {
      // Note: This does not delete the user from Firebase Auth, only Firestore.
      // Deleting from Auth requires a backend function for security reasons.
      await deleteDoc(doc(db, "users", deletingCustomer.id));
      toast({
        title: "¡Cliente Eliminado!",
        description: `El cliente ${deletingCustomer.name} ha sido eliminado del sistema.`,
      });
      setIsDeleteDialogOpen(false);
      setDeletingCustomer(null);
      fetchCustomers();
    } catch (error) {
       console.error("Error deleting customer: ", error);
       toast({
        title: "Error",
        description: "No se pudo eliminar el cliente.",
        variant: "destructive",
      });
    }
  };


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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1">
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Añadir Cliente</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Añadir Nuevo Cliente</DialogTitle>
                <DialogDescription>
                  Rellena los detalles a continuación para crear un nuevo perfil de cliente.
                </DialogDescription>
              </DialogHeader>
              <AddCustomerForm 
                onCustomerAdded={fetchCustomers}
                closeDialog={() => setIsAddDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
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
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : (
              customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell className="hidden sm:table-cell capitalize">{customer.role}</TableCell>
                <TableCell className="hidden md:table-cell">{customer.email}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>
                  {customer.email !== 'admin@pi.edu.co' && (
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
                        <DropdownMenuItem onSelect={() => handleOpenDeleteDialog(customer)} className="text-destructive focus:text-destructive">
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            )))}
          </TableBody>
        </Table>
      </CardContent>
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
    
     {/* Delete Confirmation Dialog */}
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente al cliente
                <span className="font-bold"> {deletingCustomer?.name} </span>
                y todos sus datos asociados del sistema. Ten en cuenta que esto no elimina al usuario del sistema de autenticación de Firebase.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCustomer} className="bg-destructive hover:bg-destructive/90">
                Sí, eliminar cliente
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
