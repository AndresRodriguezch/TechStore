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
          Invoice Creation
        </h3>
        <p className="text-muted-foreground max-w-md">
          The interactive invoice creation form will be available here soon. For now, please enjoy the existing features.
        </p>
        <Button className="mt-4" asChild>
          <Link href="/invoices">Back to Invoices</Link>
        </Button>
      </div>
    </Card>
  );
}
