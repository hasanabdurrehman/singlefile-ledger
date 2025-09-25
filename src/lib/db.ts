import { supabase } from './supabase'
import type { Database } from '@/types/database'
import type { Invoice, InvoiceItem } from '@/types/invoice'

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