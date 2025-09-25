import { supabase } from './supabase'
import type { Database } from '@/types/database'
import type { Invoice, InvoiceItem } from '@/types/invoice'
import type { Quotation, QuotationItem } from '@/types/quotation'

export async function getInvoices(): Promise<Invoice[]> {
  const { data: invoices, error: invoicesError } = await supabase
    .from('invoices')
    .select(`
      *,
      invoice_items:invoice_items(*)
    `)
    .order('created_at', { ascending: false })

  if (invoicesError) {
    throw invoicesError
  }

  return invoices.map(invoice => ({
    id: invoice.id,
    invoiceNumber: invoice.invoice_number,
    date: invoice.date,
    clientName: invoice.client_name,
    clientContact: invoice.client_contact,
    clientAddress: invoice.client_address,
    items: invoice.invoice_items.map(item => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.amount,
    })),
    total: invoice.total,
    advance: invoice.advance,
    remainingBalance: invoice.remaining_balance,
    paymentTerms: invoice.payment_terms,
    termsAndConditions: invoice.terms_and_conditions,
    bankAccountDetails: invoice.bank_account_details,
    createdAt: invoice.created_at,
    updatedAt: invoice.updated_at,
  }))
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select(`
      *,
      invoice_items:invoice_items(*)
    `)
    .eq('id', id)
    .single()

  if (invoiceError) {
    return null
  }

  return {
    id: invoice.id,
    invoiceNumber: invoice.invoice_number,
    date: invoice.date,
    clientName: invoice.client_name,
    clientContact: invoice.client_contact,
    clientAddress: invoice.client_address,
    items: invoice.invoice_items.map(item => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.amount,
    })),
    total: invoice.total,
    advance: invoice.advance,
    remainingBalance: invoice.remaining_balance,
    paymentTerms: invoice.payment_terms,
    termsAndConditions: invoice.terms_and_conditions,
    bankAccountDetails: invoice.bank_account_details,
    createdAt: invoice.created_at,
    updatedAt: invoice.updated_at,
  }
}

export async function createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
  const { data: newInvoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      invoice_number: invoice.invoiceNumber,
      date: invoice.date,
      client_name: invoice.clientName,
      client_contact: invoice.clientContact,
      client_address: invoice.clientAddress,
      total: invoice.total,
      advance: invoice.advance,
      remaining_balance: invoice.remainingBalance,
      payment_terms: invoice.paymentTerms,
      terms_and_conditions: invoice.termsAndConditions,
      bank_account_details: invoice.bankAccountDetails,
    })
    .select()
    .single()

  if (invoiceError) {
    throw invoiceError
  }

  const { error: itemsError } = await supabase
    .from('invoice_items')
    .insert(
      invoice.items.map(item => ({
        invoice_id: newInvoice.id,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
      }))
    )

  if (itemsError) {
    throw itemsError
  }

  return getInvoiceById(newInvoice.id) as Promise<Invoice>
}

export async function updateInvoice(id: string, invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
  const { error: invoiceError } = await supabase
    .from('invoices')
    .update({
      invoice_number: invoice.invoiceNumber,
      date: invoice.date,
      client_name: invoice.clientName,
      client_contact: invoice.clientContact,
      client_address: invoice.clientAddress,
      total: invoice.total,
      advance: invoice.advance,
      remaining_balance: invoice.remainingBalance,
      payment_terms: invoice.paymentTerms,
      terms_and_conditions: invoice.termsAndConditions,
      bank_account_details: invoice.bankAccountDetails,
    })
    .eq('id', id)

  if (invoiceError) {
    throw invoiceError
  }

  // Delete existing items
  const { error: deleteError } = await supabase
    .from('invoice_items')
    .delete()
    .eq('invoice_id', id)

  if (deleteError) {
    throw deleteError
  }

  // Insert new items
  const { error: itemsError } = await supabase
    .from('invoice_items')
    .insert(
      invoice.items.map(item => ({
        invoice_id: id,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
      }))
    )

  if (itemsError) {
    throw itemsError
  }

  return getInvoiceById(id) as Promise<Invoice>
}

export async function deleteInvoice(id: string): Promise<void> {
  // Delete items first due to foreign key constraint
  const { error: itemsError } = await supabase
    .from('invoice_items')
    .delete()
    .eq('invoice_id', id)

  if (itemsError) {
    throw itemsError
  }

  const { error: invoiceError } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id)

  if (invoiceError) {
    throw invoiceError
  }
}

export async function getQuotations(): Promise<Quotation[]> {
  const { data: quotations, error: quotationsError } = await supabase
    .from('quotations')
    .select(`
      *,
      quotation_items:quotation_items(*)
    `)
    .order('created_at', { ascending: false })

  if (quotationsError) {
    throw quotationsError
  }

  return quotations.map(quotation => ({
    id: quotation.id,
    quotationNumber: quotation.quotation_number,
    date: quotation.date,
    expiryDate: quotation.expiry_date,
    status: quotation.status,
    clientName: quotation.client_name,
    clientContact: quotation.client_contact,
    clientAddress: quotation.client_address,
    items: quotation.quotation_items.map(item => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.amount,
    })),
    total: quotation.total,
    quotationTerms: quotation.quotation_terms,
    termsAndConditions: quotation.terms_and_conditions,
    bankAccountDetails: quotation.bank_account_details,
    createdAt: quotation.created_at,
    updatedAt: quotation.updated_at,
  }))
}

export async function getQuotationById(id: string): Promise<Quotation | null> {
  const { data: quotation, error: quotationError } = await supabase
    .from('quotations')
    .select(`
      *,
      quotation_items:quotation_items(*)
    `)
    .eq('id', id)
    .single()

  if (quotationError) {
    return null
  }

  return {
    id: quotation.id,
    quotationNumber: quotation.quotation_number,
    date: quotation.date,
    expiryDate: quotation.expiry_date,
    status: quotation.status,
    clientName: quotation.client_name,
    clientContact: quotation.client_contact,
    clientAddress: quotation.client_address,
    items: quotation.quotation_items.map(item => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.amount,
    })),
    total: quotation.total,
    quotationTerms: quotation.quotation_terms,
    termsAndConditions: quotation.terms_and_conditions,
    bankAccountDetails: quotation.bank_account_details,
    createdAt: quotation.created_at,
    updatedAt: quotation.updated_at,
  }
}

export async function createQuotation(quotation: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Quotation> {
  const { data: newQuotation, error: quotationError } = await supabase
    .from('quotations')
    .insert({
      quotation_number: quotation.quotationNumber,
      date: quotation.date,
      expiry_date: quotation.expiryDate,
      status: quotation.status,
      client_name: quotation.clientName,
      client_contact: quotation.clientContact,
      client_address: quotation.clientAddress,
      total: quotation.total,
      quotation_terms: quotation.quotationTerms,
      terms_and_conditions: quotation.termsAndConditions,
      bank_account_details: quotation.bankAccountDetails,
    })
    .select()
    .single()

  if (quotationError) {
    throw quotationError
  }

  const { error: itemsError } = await supabase
    .from('quotation_items')
    .insert(
      quotation.items.map(item => ({
        quotation_id: newQuotation.id,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
      }))
    )

  if (itemsError) {
    throw itemsError
  }

  return getQuotationById(newQuotation.id) as Promise<Quotation>
}

export async function updateQuotation(id: string, quotation: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Quotation> {
  const { error: quotationError } = await supabase
    .from('quotations')
    .update({
      quotation_number: quotation.quotationNumber,
      date: quotation.date,
      expiry_date: quotation.expiryDate,
      status: quotation.status,
      client_name: quotation.clientName,
      client_contact: quotation.clientContact,
      client_address: quotation.clientAddress,
      total: quotation.total,
      quotation_terms: quotation.quotationTerms,
      terms_and_conditions: quotation.termsAndConditions,
      bank_account_details: quotation.bankAccountDetails,
    })
    .eq('id', id)

  if (quotationError) {
    throw quotationError
  }

  // Delete existing items
  const { error: deleteError } = await supabase
    .from('quotation_items')
    .delete()
    .eq('quotation_id', id)

  if (deleteError) {
    throw deleteError
  }

  // Insert new items
  const { error: itemsError } = await supabase
    .from('quotation_items')
    .insert(
      quotation.items.map(item => ({
        quotation_id: id,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
      }))
    )

  if (itemsError) {
    throw itemsError
  }

  return getQuotationById(id) as Promise<Quotation>
}

export async function deleteQuotation(id: string): Promise<void> {
  // Delete items first due to foreign key constraint
  const { error: itemsError } = await supabase
    .from('quotation_items')
    .delete()
    .eq('quotation_id', id)

  if (itemsError) {
    throw itemsError
  }

  const { error: quotationError } = await supabase
    .from('quotations')
    .delete()
    .eq('id', id)

  if (quotationError) {
    throw quotationError
  }
}

export async function convertQuotationToInvoice(quotationId: string, invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
  // First, create the invoice
  const invoice = await createInvoice(invoiceData)

  // Then update the quotation status to 'converted'
  const { error: updateError } = await supabase
    .from('quotations')
    .update({ status: 'converted' })
    .eq('id', quotationId)

  if (updateError) {
    throw updateError
  }

  return invoice
}

export async function getCompanyInfo() {
  const { data, error } = await supabase
    .from('company_info')
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return {
    name: data.name,
    address: data.address,
    phone: data.phone || undefined,
    email: data.email || undefined,
  }
}