import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Edit, Download } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getInvoiceById, getCompanyInfo } from '@/lib/db';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import type { Invoice } from '@/types/invoice';
import type { Company } from '@/types/invoice';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        if (!id) return;
        const invoiceData = await getInvoiceById(id);
        const companyData = await getCompanyInfo();
        setInvoice(invoiceData);
        setCompany(companyData);
      } catch (error) {
        console.error('Error loading invoice:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInvoice();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!invoice || !company) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invoice Not Found</h1>
          <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background print:min-h-0 print:bg-white">
      {/* Action Bar - Hidden on print */}
      <div className="print:hidden bg-muted/50 border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-semibold">Invoice #{invoice.invoiceNumber}</h1>
              <Badge variant={invoice.remainingBalance > 0 ? "secondary" : "default"}>
                {invoice.remainingBalance > 0 ? "Pending" : "Paid"}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate(`/edit/${invoice.id}`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="container mx-auto px-6 py-8 print:px-0 print:py-0 max-w-4xl">
        <Card className="invoice-shadow print:shadow-none print:border-none">
          <CardContent className="p-8 print:p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-primary mb-2">
                  {company.name.split(' ').map((word, index, arr) => (
                    index === arr.length - 1 
                      ? <span key={index} className="text-yellow-500 print:text-yellow-600">{word}</span>
                      : <span key={index}>{word + ' '}</span>
                  ))}
                </h1>
                <p className="text-muted-foreground">{company.address}</p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold mb-2">Invoice</h2>
                <div className="space-y-1 text-sm">
                  <div><strong>Invoice No.</strong> {invoice.invoiceNumber}</div>
                  <div><strong>Date:</strong> {invoice.date}</div>
                </div>
              </div>
            </div>

            {/* Client Info */}
            <div className="mb-8">
              <h3 className="font-semibold mb-2">Bill To:</h3>
              <div className="text-sm space-y-1">
                <div className="font-medium">{invoice.clientName}</div>
                <div>Contact: {invoice.clientContact}</div>
                <div>Address: {invoice.clientAddress}</div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Sr No.</th>
                      <th className="text-left p-3 font-medium">Description</th>
                      <th className="text-right p-3 font-medium">Quantity</th>
                      <th className="text-right p-3 font-medium">Rate</th>
                      <th className="text-right p-3 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, index) => (
                      <tr key={item.id} className="border-t">
                        <td className="p-3">{index + 1}</td>
                        <td className="p-3">{item.description}</td>
                        <td className="p-3 text-right">{item.quantity}</td>
                        <td className="p-3 text-right">{item.rate.toLocaleString()}.00</td>
                        <td className="p-3 text-right">{item.amount.toLocaleString()}.00</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-medium">Rs. {invoice.total.toLocaleString()}.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Advance:</span>
                  <span className="font-medium">Rs. {invoice.advance.toLocaleString()}.00</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Remaining Balance:</span>
                  <span className="font-bold">Rs. {invoice.remainingBalance.toLocaleString()}.00</span>
                </div>
              </div>
            </div>

            {/* Payment Terms */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Payment Terms:</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {invoice.paymentTerms}
              </p>
            </div>

            {/* Bank Details */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Bank Account Details:</h3>
              <p className="text-sm text-muted-foreground">
                {invoice.bankAccountDetails}
              </p>
            </div>

            {/* Terms & Conditions */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Terms & Conditions:</h3>
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {invoice.termsAndConditions}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-4 border-t text-[10px] text-muted-foreground">
              <p>This is a system-generated document, no signature is required.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            @page {
              margin: 0;
              size: A4;
            }
            
            html, body { 
              margin: 0;
              padding: 0;
              height: auto;
              background: white !important;
              color: black !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            .print\\:text-yellow-600 {
              color: #ca8a04 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            .container {
              max-width: none !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            
            .print\\:hidden {
              display: none !important;
            }
            
            .print\\:shadow-none {
              box-shadow: none !important;
            }
            
            .print\\:border-none {
              border: none !important;
            }
            
            .print\\:px-0 {
              padding-left: 0 !important;
              padding-right: 0 !important;
            }
            
            .print\\:py-0 {
              padding-top: 0 !important;
              padding-bottom: 0 !important;
            }
            
            .print\\:p-6 {
              padding: 1rem !important;
            }

            h1 {
              font-size: 1.5rem !important;
              margin-bottom: 0.5rem !important;
            }

            h2 {
              font-size: 1.25rem !important;
              margin-bottom: 0.5rem !important;
            }

            h3 {
              font-size: 1rem !important;
              margin-bottom: 0.25rem !important;
            }

            table {
              font-size: 0.875rem !important;
            }

            .mb-8 {
              margin-bottom: 0.75rem !important;
            }

            .mb-6 {
              margin-bottom: 0.5rem !important;
            }

            .p-8 {
              padding: 1rem !important;
            }

            .p-3 {
              padding: 0.5rem !important;
            }
            
            .space-y-1 > * + * {
              margin-top: 0.15rem !important;
            }
            
            .space-y-2 > * + * {
              margin-top: 0.25rem !important;
            }
            
            .leading-relaxed {
              line-height: 1.4 !important;
            }
            }
          }
        `
      }} />
    </div>
  );
};

export default InvoiceDetail;