import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, FileText, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getQuotationById, createQuotation, updateQuotation, getQuotations } from '@/lib/db';
import { Quotation, QuotationItem } from '@/types/quotation';
import { useToast } from '@/hooks/use-toast';

const CreateEditQuotation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id;

  const [formData, setFormData] = useState<Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'>>({
    quotationNumber: '',
    date: new Date().toLocaleDateString('en-GB'),
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'), // 30 days from now
    status: 'draft',
    clientName: '',
    clientContact: '',
    clientAddress: '',
    items: [{ id: '1', description: '', quantity: 1, rate: 0, amount: 0 }],
    total: 0,
    quotationTerms: `1. Validity: This quotation is valid for 30 days from the date of issue.
2. Payment Terms: 50% advance payment required to commence work, remaining 50% upon completion.
3. Scope of Work: As detailed in the quotation items above.
4. Timeline: Work will commence within 7 days of receiving advance payment.
5. Warranty: All workmanship guaranteed for 6 months from completion date.`,
    termsAndConditions: `1. This quotation is based on the information provided by the client and current market rates.
2. Any changes in scope, specifications, or additional work will incur extra charges.
3. The quoted prices are exclusive of any applicable taxes.
4. Material costs are subject to change based on market fluctuations.
5. Client approval is required before commencing any work.
6. All intellectual property rights remain with the service provider unless otherwise agreed.`,
    bankAccountDetails: 'Meezan Bank 03001005550334 Hassan Abdur Rehman.',
  });

  useEffect(() => {
    const loadQuotation = async () => {
      try {
        if (isEditing && id) {
          const quotation = await getQuotationById(id);
          if (quotation) {
            setFormData({
              quotationNumber: quotation.quotationNumber,
              date: quotation.date,
              expiryDate: quotation.expiryDate,
              status: quotation.status,
              clientName: quotation.clientName,
              clientContact: quotation.clientContact,
              clientAddress: quotation.clientAddress,
              items: quotation.items,
              total: quotation.total,
              quotationTerms: quotation.quotationTerms,
              termsAndConditions: quotation.termsAndConditions,
              bankAccountDetails: quotation.bankAccountDetails,
            });
          }
        } else {
          // Generate next quotation number for new quotation
          const allQuotations = await getQuotations();
          const lastQuotationNumber = Math.max(...allQuotations.map(q => parseInt(q.quotationNumber) || 0));
          setFormData(prev => ({
            ...prev,
            quotationNumber: String(lastQuotationNumber + 1).padStart(4, '0'),
          }));
        }
      } catch (error) {
        console.error('Error loading quotation:', error);
        toast({
          title: 'Error',
          description: 'Failed to load quotation data',
          variant: 'destructive',
        });
      }
    };

    loadQuotation();
  }, [isEditing, id, toast]);

  const updateItemAmount = (index: number, quantity: number, rate: number) => {
    const amount = quantity * rate;
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], quantity, rate, amount };

    const total = newItems.reduce((sum, item) => sum + item.amount, 0);

    setFormData(prev => ({
      ...prev,
      items: newItems,
      total,
    }));
  };

  const addItem = () => {
    const newItem: QuotationItem = {
      id: String(Date.now()),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length === 1) return;

    const newItems = formData.items.filter((_, i) => i !== index);
    const total = newItems.reduce((sum, item) => sum + item.amount, 0);

    setFormData(prev => ({
      ...prev,
      items: newItems,
      total,
    }));
  };

  const handleSave = async () => {
    if (!formData.clientName || !formData.quotationNumber) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isEditing && id) {
        await updateQuotation(id, formData);
      } else {
        await createQuotation(formData);
      }

      toast({
        title: "Success",
        description: `Quotation ${isEditing ? 'updated' : 'created'} successfully`,
      });

      navigate('/quotations');
    } catch (error) {
      console.error('Error saving quotation:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} quotation`,
        variant: "destructive",
      });
    }
  };

  const handleSend = async () => {
    try {
      if (isEditing && id) {
        await updateQuotation(id, { ...formData, status: 'sent' });
        toast({
          title: "Success",
          description: "Quotation marked as sent",
        });
        navigate('/quotations');
      }
    } catch (error) {
      console.error('Error updating quotation status:', error);
      toast({
        title: "Error",
        description: "Failed to update quotation status",
        variant: "destructive",
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
            <h1 className="text-3xl font-bold">
              {isEditing ? 'Edit Quotation' : 'Create New Quotation'}
            </h1>
          </div>
          {isEditing && (
            <Badge variant={getStatusBadgeVariant(formData.status)} className="text-sm">
              {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
            </Badge>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company & Quotation Details */}
            <Card>
              <CardHeader>
                <CardTitle>Quotation Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="quotationNumber">Quotation Number *</Label>
                    <Input
                      id="quotationNumber"
                      value={formData.quotationNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, quotationNumber: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date.split('/').reverse().join('-')}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: new Date(e.target.value).toLocaleDateString('en-GB') }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={formData.expiryDate.split('/').reverse().join('-')}
                      onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: new Date(e.target.value).toLocaleDateString('en-GB') }))}
                    />
                  </div>
                </div>
                {isEditing && (
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="converted">Converted to Invoice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Client Details */}
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="clientName">Client Name *</Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="clientContact">Contact</Label>
                  <Input
                    id="clientContact"
                    value={formData.clientContact}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientContact: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="clientAddress">Address</Label>
                  <Textarea
                    id="clientAddress"
                    value={formData.clientAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientAddress: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Quotation Items</CardTitle>
                  <Button onClick={addItem} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div key={item.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Item {index + 1}</h4>
                        {formData.items.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div>
                        <Label htmlFor={`description-${index}`}>Description</Label>
                        <Textarea
                          id={`description-${index}`}
                          value={item.description}
                          onChange={(e) => {
                            const newItems = [...formData.items];
                            newItems[index] = { ...newItems[index], description: e.target.value };
                            setFormData(prev => ({ ...prev, items: newItems }));
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                          <Input
                            id={`quantity-${index}`}
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const quantity = parseInt(e.target.value) || 1;
                              updateItemAmount(index, quantity, item.rate);
                            }}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`rate-${index}`}>Rate (Rs.)</Label>
                          <Input
                            id={`rate-${index}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) => {
                              const rate = parseFloat(e.target.value) || 0;
                              updateItemAmount(index, item.quantity, rate);
                            }}
                          />
                        </div>
                        <div>
                          <Label>Amount (Rs.)</Label>
                          <Input
                            value={item.amount.toLocaleString()}
                            readOnly
                            className="bg-muted"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quotation Terms */}
            <Card>
              <CardHeader>
                <CardTitle>Quotation Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.quotationTerms}
                  onChange={(e) => setFormData(prev => ({ ...prev, quotationTerms: e.target.value }))}
                  className="min-h-[120px]"
                />
              </CardContent>
            </Card>

            {/* Terms & Conditions */}
            <Card>
              <CardHeader>
                <CardTitle>Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.termsAndConditions}
                  onChange={(e) => setFormData(prev => ({ ...prev, termsAndConditions: e.target.value }))}
                  className="min-h-[200px]"
                />
              </CardContent>
            </Card>

            {/* Bank Details */}
            <Card>
              <CardHeader>
                <CardTitle>Bank Account Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.bankAccountDetails}
                  onChange={(e) => setFormData(prev => ({ ...prev, bankAccountDetails: e.target.value }))}
                />
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Quotation Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Amount:</span>
                    <span className="font-bold text-lg">Rs. {formData.total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <Button onClick={handleSave} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? 'Update Quotation' : 'Save Quotation'}
                  </Button>

                  {isEditing && formData.status === 'draft' && (
                    <Button onClick={handleSend} variant="outline" className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Mark as Sent
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEditQuotation;