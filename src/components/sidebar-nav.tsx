"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, FileText, LogIn, UserPlus, ShoppingCart, Package } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const navItems = [
  { href: "/", label: "Inicio", icon: Home, tooltip: "Inicio", auth: false },
  { href: "/products", label: "Productos", icon: Package, tooltip: "Productos", auth: false },
  { href: "/cart", label: "Carrito", icon: ShoppingCart, tooltip: "Carrito", auth: true },
  { href: "/invoices", label: "Facturas", icon: FileText, tooltip: "Facturas", auth: true },
  { href: "/customers", label: "Clientes", icon: Users, tooltip: "Clientes", auth: true, adminOnly: true },
];

const authNavItems = [
    { href: "/login", label: "Iniciar Sesión", icon: LogIn, tooltip: "Iniciar Sesión" },
    { href: "/signup", label: "Registrarse", icon: UserPlus, tooltip: "Registrarse" },
]

export function SidebarNav() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();

  const isVisible = (item: typeof navItems[0]) => {
    if (!item.auth) return true; // Public item
    if (!isAuthenticated) return false; // Auth-only item, but user is not logged in
    if (item.adminOnly && user?.role !== 'admin') return false; // Admin-only item, but user is not admin
    return true; // Auth item and user is logged in (and has rights if it's admin only)
  }

  return (
    <SidebarMenu>
      {navItems.map((item) => 
        isVisible(item) && (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href}
              className="w-full justify-start"
              tooltip={item.tooltip}
            >
              <Link href={item.href}>
                <item.icon className="mr-3 h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      )}
       {!isAuthenticated && authNavItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            className="w-full justify-start"
            tooltip={item.tooltip}
          >
            <Link href={item.href}>
              <item.icon className="mr-3 h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
