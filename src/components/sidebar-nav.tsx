"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, FileText, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const navItems = [
  { href: "/", label: "Inicio", icon: Home, tooltip: "Inicio", auth: false },
  { href: "/invoices", label: "Facturas", icon: FileText, tooltip: "Facturas", auth: true },
  { href: "/customers", label: "Clientes", icon: Users, tooltip: "Clientes", auth: true },
];

const authNavItems = [
    { href: "/login", label: "Iniciar Sesión", icon: LogIn, tooltip: "Iniciar Sesión" },
    { href: "/signup", label: "Registrarse", icon: UserPlus, tooltip: "Registrarse" },
]

export function SidebarNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
         (!item.auth || isAuthenticated) && (
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
      ))}
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
