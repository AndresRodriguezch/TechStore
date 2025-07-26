import {
  Card,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CartPage() {
  return (
    <Card className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm min-h-[calc(100vh-8rem)]">
      <div className="flex flex-col items-center gap-2 text-center p-8">
        <h3 className="text-2xl font-bold tracking-tight">
          Carrito de Compras
        </h3>
        <p className="text-muted-foreground max-w-md">
          Tu carrito de compras está vacío. Explora nuestros productos y añade algunos.
        </p>
        <Button className="mt-4" asChild>
          <Link href="/">Explorar Productos</Link>
        </Button>
      </div>
    </Card>
  );
}
