import { Invoice } from '@/types/invoice';

export const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: '0006',
    date: '20/09/2022',
    clientName: 'Mr. Shahzad Qaiser',
    clientContact: '(301) 8211101',
    clientAddress: 'House#94 D.O.H.S Phase 1 Malir Cantt Karachi',
    items: [
      {
        id: '1',
        description: '40KW Solar Structure Fabrication & Welding and Electrical & System Commissioning',
        quantity: 1,
        rate: 385000.00,
        amount: 385000.00,
      },
    ],
    total: 385000.00,
    advance: 190000.00,
    remainingBalance: 195000.00,
    paymentTerms: '50% of the cost is required upfront, with the remaining 50% split into two payments: 25% at the start of electrical work and the final 25% upon project completion.',
    termsAndConditions: `1. Scope: Includes solar structure fabrication & welding, and PV electrical installation & commissioning. Extra work shall be charged separately as per actual cost & material.
2. Timeline: Work will be completed within 4 weeks of project start, subject to site readiness and material availability. Delays due to technical approvals, clarifications and site access is client's responsibility.
3. Warranty: We guarantee our workmanship for all fabrication and welding with a six-month warranty. All related and components are covered by their respective manufacturer's warranty period.
4. Responsibilities: Vendor will ensure quality and safety during execution. The client must provide access to the site, necessary approvals & permissions, electrical connections, and cooperate during inspection & testing.
5. Limitations: The vendor is not liable for mistakes, negligence, or modifications made by third parties after handover.
6. Force Majeure: Neither party shall be responsible for failure or delay caused by events beyond control (e.g., natural disasters, strikes, government restrictions).
7. Material: These charges are for labour only; no material is included in this quotation.
Project Handover: Project completion is confirmed upon the successful conclusion of commissioning, testing, and a joint inspection.`,
    bankAccountDetails: 'Meezan Bank 03001005550334 Hassan Abdur Rehman.',
    createdAt: '2022-09-20T00:00:00Z',
    updatedAt: '2022-09-20T00:00:00Z',
  },
  {
    id: '2',
    invoiceNumber: '0007',
    date: '25/09/2022',
    clientName: 'ABC Corporation',
    clientContact: '(301) 1234567',
    clientAddress: 'Block 15, Gulshan-e-Iqbal, Karachi',
    items: [
      {
        id: '1',
        description: '20KW Solar Panel Installation',
        quantity: 1,
        rate: 250000.00,
        amount: 250000.00,
      },
    ],
    total: 250000.00,
    advance: 125000.00,
    remainingBalance: 125000.00,
    paymentTerms: '50% advance payment required, remaining 50% upon completion.',
    termsAndConditions: 'Standard terms and conditions apply.',
    bankAccountDetails: 'Meezan Bank 03001005550334 Hassan Abdur Rehman.',
    createdAt: '2022-09-25T00:00:00Z',
    updatedAt: '2022-09-25T00:00:00Z',
  },
  {
    id: '3',
    invoiceNumber: '0008',
    date: '30/09/2022',
    clientName: 'XYZ Industries',
    clientContact: '(301) 9876543',
    clientAddress: 'Plot 123, SITE Industrial Area, Karachi',
    items: [
      {
        id: '1',
        description: 'Commercial Solar System - 100KW',
        quantity: 1,
        rate: 850000.00,
        amount: 850000.00,
      },
    ],
    total: 850000.00,
    advance: 425000.00,
    remainingBalance: 425000.00,
    paymentTerms: '50% advance, 25% at material delivery, 25% upon completion.',
    termsAndConditions: 'Commercial installation terms apply with extended warranty.',
    bankAccountDetails: 'Meezan Bank 03001005550334 Hassan Abdur Rehman.',
    createdAt: '2022-09-30T00:00:00Z',
    updatedAt: '2022-09-30T00:00:00Z',
  },
];

export const companyInfo = {
  name: 'Asaan Solar',
  address: '74-G, Block 6, P.E.C.H.S, Karachi',
  phone: '+92 321 1234567',
  email: 'info@asaansolar.com',
};