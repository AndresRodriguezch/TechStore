"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection } from "firebase/firestore";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";

const productSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  description: z.string().min(1, "La descripción es requerida."),
  price: z.coerce.number().min(0, "El precio no puede ser negativo."),
  category: z.string().min(1, "La categoría es requerida."),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo."),
  imageUrl: z.string().url("Debe ser una URL válida."),
});

type ProductFormValues = z.infer<typeof productSchema>;

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

export default function NewProductPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      stock: 0,
      imageUrl: "",
    },
  });

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    setLoading(true);
    try {
      await addDoc(collection(db, "products"), data);
      toast({
        title: "¡Producto Creado!",
        description: "El nuevo producto ha sido añadido al catálogo.",
      });
      router.push("/products");
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al crear el producto.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (authLoading) {
    return <p>Cargando...</p>;
  }

  if (!user || user.role !== 'admin') {
    return <AccessDenied />;
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Crear Nuevo Producto</CardTitle>
        <CardDescription>
          Rellena los detalles para añadir un nuevo producto al catálogo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Producto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Laptop Pro 15''" {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe el producto..." {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="Ej: 1299.99" {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ej: 25" {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Computadoras" {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de la Imagen</FormLabel>
                  <FormControl>
                    <Input placeholder="https://ejemplo.com/imagen.png" {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-4">
               <Button variant="outline" type="button" onClick={() => router.back()} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar Producto'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
