import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, FileText, ArrowRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getQuotationById, convertQuotationToInvoice, getCompanyInfo } from '@/lib/db';
import { Quotation } from '@/types/quotation';
import { Company } from '@/types/invoice';
import { useToast } from '@/hooks/use-toast';

const QuotationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      if (!id) return;

      const [quotationData, companyData] = await Promise.all([
        getQuotationById(id),
        getCompanyInfo().catch(() => null), // Company info might not exist
      ]);

      setQuotation(quotationData);
      setCompany(companyData);
    } catch (error) {
      console.error('Error loading quotation:', error);
      toast({
        title: 'Error',
        description: 'Failed to load quotation details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToInvoice = async () => {
    if (!quotation) return;

    try {
      // Create invoice data from quotation
      const invoiceData = {
        invoiceNumber: '', // Will be generated
        date: new Date().toLocaleDateString('en-GB'),
        clientName: quotation.clientName,
        clientContact: quotation.clientContact,
        clientAddress: quotation.clientAddress,
        items: quotation.items,
        total: quotation.total,
        advance: 0, // Can be set later
        remainingBalance: quotation.total,
        paymentTerms: quotation.quotationTerms,
        termsAndConditions: quotation.termsAndConditions,
        bankAccountDetails: quotation.bankAccountDetails,
      };

      await convertQuotationToInvoice(quotation.id, invoiceData);

      // Update local state
      setQuotation(prev => prev ? { ...prev, status: 'converted' } : null);

      toast({
        title: 'Success',
        description: 'Quotation converted to invoice successfully',
      });

      // Navigate to invoices page
      navigate('/');
    } catch (error) {
      console.error('Error converting quotation to invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to convert quotation to invoice',
        variant: 'destructive',
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'sent': return 'default';
      case 'accepted': return 'default';
      case 'rejected': return 'destructive';
      case 'converted': return 'outline';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading quotation...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Quotation Not Found</h1>
            <Button onClick={() => navigate('/quotations')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quotations
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/quotations')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Quotation #{quotation.quotationNumber}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={getStatusBadgeVariant(quotation.status)}>
                  {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                </Badge>
                <span className="text-muted-foreground">
                  Expires: {formatDate(quotation.expiryDate)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Download className="h-4 w-4 mr-2" />
              Print
            </Button>

            {quotation.status !== 'converted' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/quotations/${quotation.id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>

                <Button onClick={handleConvertToInvoice}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Convert to Invoice
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Quotation Content */}
        <div className="max-w-4xl mx-auto">
          {/* Company Header */}
          {company && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">{company.name}</h2>
                  <p className="text-muted-foreground whitespace-pre-line">{company.address}</p>
                  {company.phone && <p className="text-muted-foreground">Phone: {company.phone}</p>}
                  {company.email && <p className="text-muted-foreground">Email: {company.email}</p>}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quotation Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Quotation Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Quotation Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Quotation Number:</span> #{quotation.quotationNumber}</p>
                    <p><span className="font-medium">Date:</span> {formatDate(quotation.date)}</p>
                    <p><span className="font-medium">Expiry Date:</span> {formatDate(quotation.expiryDate)}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Client Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Name:</span> {quotation.clientName}</p>
                    {quotation.clientContact && <p><span className="font-medium">Contact:</span> {quotation.clientContact}</p>}
                    {quotation.clientAddress && <p><span className="font-medium">Address:</span> {quotation.clientAddress}</p>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quotation.items.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium">Item {index + 1}</h4>
                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-muted-foreground">
                        Quantity: {item.quantity} × Rs. {item.rate.toLocaleString()}
                      </div>
                      <div className="font-semibold">
                        Rs. {item.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-lg font-bold">
                    Total: Rs. {quotation.total.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quotation Terms */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Quotation Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-line text-sm">
                {quotation.quotationTerms}
              </div>
            </CardContent>
          </Card>

          {/* Terms & Conditions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-line text-sm">
                {quotation.termsAndConditions}
              </div>
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Bank Account Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-line text-sm">
                {quotation.bankAccountDetails}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuotationDetail;