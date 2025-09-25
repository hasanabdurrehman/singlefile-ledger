export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  clientName: string;
  clientContact: string;
  clientAddress: string;
  items: InvoiceItem[];
  total: number;
  advance: number;
  remainingBalance: number;
  paymentTerms: string;
  termsAndConditions: string;
  bankAccountDetails: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  name: string;
  address: string;
  phone?: string;
  email?: string;
}