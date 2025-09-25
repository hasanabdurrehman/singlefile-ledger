import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getQuotations, deleteQuotation, convertQuotationToInvoice } from '@/lib/db';
import { Quotation } from '@/types/quotation';
import { useToast } from '@/hooks/use-toast';

const Quotations = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuotations();
  }, []);

  const loadQuotations = async () => {
    try {
      const data = await getQuotations();
      setQuotations(data);
    } catch (error) {
      console.error('Error loading quotations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load quotations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteQuotation(id);
      setQuotations(prev => prev.filter(q => q.id !== id));
      toast({
        title: 'Success',
        description: 'Quotation deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting quotation:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete quotation',
        variant: 'destructive',
      });
    }
  };

  const handleConvertToInvoice = async (quotation: Quotation) => {
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
      setQuotations(prev => prev.map(q =>
        q.id === quotation.id ? { ...q, status: 'converted' } : q
      ));

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
            <div className="text-lg">Loading quotations...</div>
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
          <h1 className="text-3xl font-bold">Quotations</h1>
          <Button onClick={() => navigate('/quotations/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Quotation
          </Button>
        </div>

        {/* Quotations List */}
        {quotations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No quotations yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first quotation to get started with managing your estimates and proposals.
              </p>
              <Button onClick={() => navigate('/quotations/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Quotation
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {quotations.map((quotation) => (
              <Card key={quotation.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          Quotation #{quotation.quotationNumber}
                        </h3>
                        <Badge variant={getStatusBadgeVariant(quotation.status)}>
                          {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-1">
                        {quotation.clientName}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Date: {formatDate(quotation.date)}</span>
                        <span>Expires: {formatDate(quotation.expiryDate)}</span>
                        <span className="font-medium text-foreground">
                          Rs. {quotation.total.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/quotations/${quotation.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/quotations/${quotation.id}/edit`)}
                        disabled={quotation.status === 'converted'}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      {quotation.status !== 'converted' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConvertToInvoice(quotation)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Convert to Invoice
                        </Button>
                      )}

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Quotation</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete quotation #{quotation.quotationNumber}?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(quotation.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Quotations;