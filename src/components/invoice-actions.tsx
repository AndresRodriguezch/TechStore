"use client";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";

export function InvoiceActions({ invoiceNumber }: { invoiceNumber: string }) {
  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = () => {
    const invoiceElement = document.getElementById("invoice-content");
    if (invoiceElement) {
      html2canvas(invoiceElement, {
         scale: 2, // Aumenta la escala para mejor resolución
         useCORS: true,
         backgroundColor: null,
      }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "pt",
          format: "letter",
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Factura-${invoiceNumber}.pdf`);
      });
    }
  };

  return (
    <>
      <Button variant="outline" onClick={handlePrint}>
        <Printer className="mr-2 h-4 w-4" />
        Imprimir
      </Button>
      <Button onClick={handleExportPdf}>
        <Download className="mr-2 h-4 w-4" />
        Exportar PDF
      </Button>
    </>
  );
}
