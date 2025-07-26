"use client";

import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";

export function InvoiceActions() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Button variant="outline" onClick={handlePrint}>
        <Printer className="mr-2 h-4 w-4" />
        Imprimir
      </Button>
      <Button onClick={handlePrint}>
        <Download className="mr-2 h-4 w-4" />
        Exportar PDF
      </Button>
    </>
  );
}
