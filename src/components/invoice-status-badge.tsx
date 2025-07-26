import { Badge } from "@/components/ui/badge";
import type { Invoice } from "@/lib/types";

export default function InvoiceStatusBadge({ status }: { status: Invoice['status'] }) {
  return (
    <Badge
      variant={
        status === 'Pagada' ? 'secondary' :
        status === 'Pendiente' ? 'outline' :
        'destructive'
      }
      className={
        status === 'Pagada' ? 'border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-100/80 dark:bg-emerald-800/60 dark:text-emerald-50'
        : status === 'Pendiente' ? 'border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300'
        : ''
      }
    >
      {status}
    </Badge>
  );
}
