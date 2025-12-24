import { renderToBuffer } from '@react-pdf/renderer'
import { InvoiceDocument, InvoiceData } from './template'
import React from 'react'

export async function generateInvoicePDF(data: InvoiceData): Promise<Uint8Array> {
    const pdfBuffer = await renderToBuffer(
        React.createElement(InvoiceDocument, { data }) as any
    )
    return pdfBuffer
}

export function generateInvoiceNumber(): string {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `INV-${year}${month}-${random}`
}

export type { InvoiceData }
