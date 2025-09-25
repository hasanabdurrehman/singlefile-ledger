import { useState } from 'react';
import { Plus, FileText, Calendar, Users, DollarSign, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockInvoices } from '@/data/mockInvoices';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredInvoices = mockInvoices.filter(invoice =>
    invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = mockInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const totalOutstanding = mockInvoices.reduce((sum, invoice) => sum + invoice.remainingBalance, 0);
  const totalPaid = totalRevenue - totalOutstanding;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Invoice Management</h1>
              <p className="text-primary-foreground/80">Manage your invoices efficiently</p>
            </div>
            <Link to="/create">
              <Button variant="secondary" size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Create Invoice
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockInvoices.length}</div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rs. {totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">Rs. {totalPaid.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
              <DollarSign className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">Rs. {totalOutstanding.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices by client name or invoice number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Invoices List */}
        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Recent Invoices</h2>
            <Link to="/create">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Invoice
              </Button>
            </Link>
          </div>

          <div className="grid gap-4">
            {filteredInvoices.map((invoice) => (
              <Card key={invoice.id} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">Invoice #{invoice.invoiceNumber}</h3>
                        <Badge variant={invoice.remainingBalance > 0 ? "secondary" : "default"}>
                          {invoice.remainingBalance > 0 ? "Pending" : "Paid"}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="h-4 w-4" />
                          {invoice.clientName}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {invoice.date}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold">Rs. {invoice.total.toLocaleString()}</div>
                        {invoice.remainingBalance > 0 && (
                          <div className="text-sm text-warning">
                            Outstanding: Rs. {invoice.remainingBalance.toLocaleString()}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Link to={`/invoice/${invoice.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                        <Link to={`/edit/${invoice.id}`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredInvoices.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? 'Try adjusting your search terms.' : 'Create your first invoice to get started.'}
                </p>
                <Link to="/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Invoice
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;