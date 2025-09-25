import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getInvoiceById, createInvoice, updateInvoice, getInvoices } from '@/lib/db';
import { Invoice, InvoiceItem } from '@/types/invoice';
import { useToast } from '@/hooks/use-toast';

const CreateEditInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id;

  const [formData, setFormData] = useState<Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>>({
    invoiceNumber: '',
    date: new Date().toLocaleDateString('en-GB'),
    clientName: '',
    clientContact: '',
    clientAddress: '',
    items: [{ id: '1', description: '', quantity: 1, rate: 0, amount: 0 }],
    total: 0,
    advance: 0,
    remainingBalance: 0,
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
  });

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        if (isEditing && id) {
          const invoice = await getInvoiceById(id);
          if (invoice) {
            setFormData({
              invoiceNumber: invoice.invoiceNumber,
              date: invoice.date,
              clientName: invoice.clientName,
              clientContact: invoice.clientContact,
              clientAddress: invoice.clientAddress,
              items: invoice.items,
              total: invoice.total,
              advance: invoice.advance,
              remainingBalance: invoice.remainingBalance,
              paymentTerms: invoice.paymentTerms,
              termsAndConditions: invoice.termsAndConditions,
              bankAccountDetails: invoice.bankAccountDetails,
            });
          }
        } else {
          // Generate next invoice number for new invoice
          const allInvoices = await getInvoices();
          const lastInvoiceNumber = Math.max(...allInvoices.map(inv => parseInt(inv.invoiceNumber) || 0));
          setFormData(prev => ({
            ...prev,
            invoiceNumber: String(lastInvoiceNumber + 1).padStart(4, '0'),
          }));
        }
      } catch (error) {
        console.error('Error loading invoice:', error);
        toast({
          title: 'Error',
          description: 'Failed to load invoice data',
          variant: 'destructive',
        });
      }
    };

    loadInvoice();
  }, [isEditing, id, toast]);

  const updateItemAmount = (index: number, quantity: number, rate: number) => {
    const amount = quantity * rate;
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], quantity, rate, amount };
    
    const total = newItems.reduce((sum, item) => sum + item.amount, 0);
    const remainingBalance = total - formData.advance;
    
    setFormData(prev => ({
      ...prev,
      items: newItems,
      total,
      remainingBalance,
    }));
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
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
    const remainingBalance = total - formData.advance;
    
    setFormData(prev => ({
      ...prev,
      items: newItems,
      total,
      remainingBalance,
    }));
  };

  const updateAdvance = (advance: number) => {
    const remainingBalance = formData.total - advance;
    setFormData(prev => ({
      ...prev,
      advance,
      remainingBalance,
    }));
  };

  const handleSave = async () => {
    if (!formData.clientName || !formData.invoiceNumber) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isEditing && id) {
        await updateInvoice(id, formData);
      } else {
        await createInvoice(formData);
      }

      toast({
        title: "Success",
        description: `Invoice ${isEditing ? 'updated' : 'created'} successfully`,
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} invoice`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">
            {isEditing ? 'Edit Invoice' : 'Create New Invoice'}
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company & Invoice Details */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="invoiceNumber">Invoice Number *</Label>
                    <Input
                      id="invoiceNumber"
                      value={formData.invoiceNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                </div>
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
                  <CardTitle>Invoice Items</CardTitle>
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

            {/* Payment Terms */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                  className="min-h-[100px]"
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
                <CardTitle>Invoice Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium">Rs. {formData.total.toLocaleString()}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="advance">Advance Payment (Rs.)</Label>
                    <Input
                      id="advance"
                      type="number"
                      min="0"
                      max={formData.total}
                      value={formData.advance}
                      onChange={(e) => updateAdvance(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-medium">Remaining Balance:</span>
                    <span className="font-bold">Rs. {formData.remainingBalance.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <Button onClick={handleSave} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? 'Update Invoice' : 'Save Invoice'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEditInvoice;