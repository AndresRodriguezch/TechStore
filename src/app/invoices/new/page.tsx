import {
  Card,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NewInvoicePage() {
  return (
    <Card className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm min-h-[calc(100vh-8rem)]">
      <div className="flex flex-col items-center gap-2 text-center p-8">
        <h3 className="text-2xl font-bold tracking-tight">
          Creación de Factura
        </h3>
        <p className="text-muted-foreground max-w-md">
          El formulario interactivo de creación de facturas estará disponible aquí pronto. Por ahora, disfruta de las funciones existentes.
        </p>
        <Button className="mt-4" asChild>
          <Link href="/invoices">Volver a Facturas</Link>
        </Button>
      </div>
    </Card>
  );
}
