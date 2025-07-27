
"use client";

import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Phone, Home } from "lucide-react";

export default function ProfilePage() {
    const { user, loading } = useAuth();

    if (loading) {
        return <p>Cargando perfil...</p>
    }

    if (!user) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Perfil no encontrado</CardTitle>
                    <CardDescription>
                        Debes iniciar sesión para ver tu perfil.
                    </CardDescription>
                </CardHeader>
            </Card>
        )
    }

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${user.name}`} alt={user.name} />
                        <AvatarFallback>{getInitials(user.name || 'U')}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-3xl">{user.name}</CardTitle>
                        <CardDescription className="text-lg">{user.email}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                     <h3 className="font-semibold">Información de Contacto</h3>
                     <div className="flex items-center gap-3 text-muted-foreground">
                        <Mail className="h-5 w-5" />
                        <span>{user.email}</span>
                     </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Phone className="h-5 w-5" />
                        <span>{user.phone || 'No especificado'}</span>
                     </div>
                </div>
                <div className="space-y-2">
                    <h3 className="font-semibold">Dirección</h3>
                    {user.address ? (
                        <div className="flex items-start gap-3 text-muted-foreground">
                             <Home className="h-5 w-5 mt-1 flex-shrink-0" />
                            <p>
                                {user.address.street}<br />
                                {user.address.city}, {user.address.country}
                            </p>
                        </div>
                    ) : (
                         <div className="flex items-center gap-3 text-muted-foreground">
                            <Home className="h-5 w-5" />
                            <span>No especificada</span>
                        </div>
                    )}
                </div>
                <div className="pt-4 flex justify-end">
                    <Button variant="outline">Editar Perfil</Button>
                </div>
            </CardContent>
        </Card>
    )
}
