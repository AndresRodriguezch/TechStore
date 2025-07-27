
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: {
    street: string;
    city: string;
    country: string;
  };
  role?: 'admin' | 'user';
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  taxRate: number;
  discount: number;
  status: 'Pagada' | 'Pendiente' | 'Vencida';
  paymentMethod: 'card' | 'pse';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
}
