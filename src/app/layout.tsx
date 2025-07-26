import type { Metadata } from 'next';
import './globals.css';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarInset, SidebarTrigger, SidebarRail } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { SidebarNav } from '@/components/sidebar-nav';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Gem, PanelLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'E-commerce',
  description: 'Gestiona clientes y facturas con facilidad.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <SidebarProvider>
          <Sidebar collapsible="icon" className="print:hidden">
            <SidebarHeader className="p-4">
              <div className="flex items-center justify-between gap-3">
                 <div className="flex items-center gap-3 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center">
                    <Button variant="ghost" size="icon" className="text-primary rounded-lg flex-shrink-0">
                      <Gem className="h-7 w-7" />
                    </Button>
                    <div className="flex-grow overflow-hidden group-data-[collapsible=icon]:hidden">
                       <h1 className="text-xl font-semibold truncate">E-commerce</h1>
                    </div>
                </div>
              </div>
            </SidebarHeader>
            <SidebarContent className="p-2 pt-0">
              <SidebarNav />
            </SidebarContent>
            <SidebarFooter className="p-2 flex flex-col gap-2">
               <div className="hidden md:flex justify-start group-data-[collapsible=icon]:justify-center">
                  <SidebarTrigger />
                </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <Button variant="ghost" className="w-full justify-start gap-3 p-2 h-auto text-left">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="person portrait" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow overflow-hidden group-data-[collapsible=icon]:hidden">
                      <p className="text-sm font-medium truncate">Usuario Admin</p>
                      <p className="text-xs text-muted-foreground truncate">admin@example.com</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mb-2" align="end" side="top">
                  <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Perfil</DropdownMenuItem>
                  <DropdownMenuItem>Configuración</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Cerrar Sesión</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarFooter>
            <SidebarRail />
          </Sidebar>
          <SidebarInset>
            <header className="flex h-14 items-center gap-4 border-b bg-card px-6 sticky top-0 z-10 md:hidden print:hidden">
              <SidebarTrigger />
              <h1 className="text-lg font-semibold">E-commerce</h1>
            </header>
            <main className="flex-1 p-4 sm:p-6 print:p-0">{children}</main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
