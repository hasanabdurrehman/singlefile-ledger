export interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  date: string;
  expiryDate: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'converted';
  clientName: string;
  clientContact: string;
  clientAddress: string;
  items: QuotationItem[];
  total: number;
  quotationTerms: string;
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