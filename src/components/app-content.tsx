"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarInset, SidebarTrigger, SidebarRail } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/sidebar-nav';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Gem, PanelLeft, LogOut, User } from 'lucide-react';

export default function AppContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();

  const publicPaths = ['/login', '/signup'];
  if (publicPaths.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <>
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
            <SidebarTrigger>
              <PanelLeft />
              <span className="group-data-[collapsible=icon]:hidden ml-2">Ocultar barra</span>
            </SidebarTrigger>
          </div>
          {isAuthenticated && user && (
            <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-3 p-2 h-auto text-left">
                  <div className="h-9 w-9 flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex-grow overflow-hidden group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium truncate">{user?.name || 'Usuario Admin'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mb-2" align="end" side="top">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Perfil</DropdownMenuItem>
                <DropdownMenuItem>Configuración</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>Cerrar Sesión</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" className="w-full justify-start group-data-[collapsible=icon]:justify-center" onClick={() => logout()}>
              <LogOut className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
              <span className="group-data-[collapsible=icon]:hidden">Cerrar Sesión</span>
            </Button>
            </>
          )}
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
    </>
  );
}
