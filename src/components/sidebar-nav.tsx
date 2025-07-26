"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, FileText } from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const navItems = [
  { href: "/", label: "Inicio", icon: Home, tooltip: "Inicio" },
  { href: "/invoices", label: "Facturas", icon: FileText, tooltip: "Facturas" },
  { href: "/customers", label: "Clientes", icon: Users, tooltip: "Clientes" },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
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
