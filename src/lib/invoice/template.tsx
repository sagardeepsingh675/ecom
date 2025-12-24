import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: 40,
        fontFamily: 'Helvetica',
    },
    // Header Section
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        paddingBottom: 20,
        borderBottomWidth: 3,
        borderBottomColor: '#4f46e5',
    },
    companyInfo: {
        maxWidth: '50%',
    },
    logo: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 6,
    },
    companyDetail: {
        fontSize: 9,
        color: '#6b7280',
        marginBottom: 2,
    },
    invoiceHeader: {
        textAlign: 'right',
    },
    invoiceTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#4f46e5',
    },
    invoiceNumber: {
        fontSize: 10,
        color: '#6b7280',
        marginTop: 4,
    },
    // Paid Badge
    badge: {
        backgroundColor: '#10b981',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 4,
        marginTop: 8,
        alignSelf: 'flex-end',
    },
    badgeText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    // Info Section
    infoSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        gap: 20,
    },
    infoBlock: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f9fafb',
        borderRadius: 8,
    },
    infoLabel: {
        fontSize: 9,
        color: '#9ca3af',
        marginBottom: 8,
        textTransform: 'uppercase',
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    infoText: {
        fontSize: 10,
        color: '#374151',
        marginBottom: 3,
    },
    infoTextBold: {
        fontSize: 11,
        color: '#111827',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    // Table
    table: {
        marginBottom: 24,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#4f46e5',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
    },
    tableHeaderText: {
        color: '#ffffff',
        fontSize: 9,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        backgroundColor: '#ffffff',
    },
    tableRowAlt: {
        backgroundColor: '#f9fafb',
    },
    tableCell: {
        fontSize: 10,
        color: '#374151',
    },
    tableCellBold: {
        fontSize: 10,
        color: '#111827',
        fontWeight: 'bold',
    },
    col1: { width: '50%' },
    col2: { width: '15%', textAlign: 'center' },
    col3: { width: '17.5%', textAlign: 'right' },
    col4: { width: '17.5%', textAlign: 'right' },
    itemDetails: {
        fontSize: 8,
        color: '#6b7280',
        marginTop: 4,
    },
    // Totals
    totalsContainer: {
        alignItems: 'flex-end',
    },
    totalsSection: {
        width: 250,
        backgroundColor: '#f9fafb',
        padding: 16,
        borderRadius: 8,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    totalLabel: {
        fontSize: 10,
        color: '#6b7280',
    },
    totalValue: {
        fontSize: 10,
        color: '#374151',
    },
    grandTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 12,
        marginTop: 8,
        borderTopWidth: 2,
        borderTopColor: '#4f46e5',
    },
    grandTotalLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111827',
    },
    grandTotalValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4f46e5',
    },
    // GST Notice
    gstNotice: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    gstText: {
        fontSize: 8,
        color: '#6b7280',
    },
    // Footer
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 40,
        right: 40,
        textAlign: 'center',
    },
    footerContent: {
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    footerText: {
        fontSize: 9,
        color: '#9ca3af',
        marginBottom: 4,
    },
    footerTextBold: {
        fontSize: 9,
        color: '#6b7280',
        fontWeight: 'bold',
    },
    thankYou: {
        fontSize: 12,
        color: '#4f46e5',
        fontWeight: 'bold',
        marginBottom: 8,
    },
})

export interface InvoiceData {
    invoiceNumber: string
    invoiceDate: string
    customerName: string
    customerEmail: string
    customerPhone?: string
    items: Array<{
        description: string
        details?: string
        quantity: number
        unitPrice: number
        total: number
    }>
    subtotal: number
    discount?: number
    tax?: number
    taxRate?: number
    total: number
    paymentMethod?: string
    transactionId?: string
    companyName?: string
    companyEmail?: string
    companyAddress?: string
    companyPhone?: string
    gstEnabled?: boolean
    gstNumber?: string
    isPaid?: boolean
}

export function InvoiceDocument({ data }: { data: InvoiceData }) {
    const formatCurrency = (amount: number) => {
        return `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.companyInfo}>
                        <Text style={styles.logo}>{data.companyName || 'WebinarPro'}</Text>
                        {data.companyEmail && <Text style={styles.companyDetail}>{data.companyEmail}</Text>}
                        {data.companyPhone && <Text style={styles.companyDetail}>{data.companyPhone}</Text>}
                        {data.companyAddress && <Text style={styles.companyDetail}>{data.companyAddress}</Text>}
                        {data.gstEnabled && data.gstNumber && (
                            <Text style={[styles.companyDetail, { marginTop: 4, fontWeight: 'bold' }]}>
                                GSTIN: {data.gstNumber}
                            </Text>
                        )}
                    </View>
                    <View style={styles.invoiceHeader}>
                        <Text style={styles.invoiceTitle}>INVOICE</Text>
                        <Text style={styles.invoiceNumber}>#{data.invoiceNumber}</Text>
                        {data.isPaid && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>PAID</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Info Section */}
                <View style={styles.infoSection}>
                    <View style={styles.infoBlock}>
                        <Text style={styles.infoLabel}>Bill To</Text>
                        <Text style={styles.infoTextBold}>{data.customerName}</Text>
                        <Text style={styles.infoText}>{data.customerEmail}</Text>
                        {data.customerPhone && <Text style={styles.infoText}>{data.customerPhone}</Text>}
                    </View>
                    <View style={styles.infoBlock}>
                        <Text style={styles.infoLabel}>Invoice Details</Text>
                        <Text style={styles.infoText}>Date: {data.invoiceDate}</Text>
                        {data.transactionId && (
                            <Text style={styles.infoText}>Transaction: {data.transactionId}</Text>
                        )}
                        {data.paymentMethod && (
                            <Text style={styles.infoText}>Payment: {data.paymentMethod}</Text>
                        )}
                    </View>
                </View>

                {/* Items Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderText, styles.col1]}>Description</Text>
                        <Text style={[styles.tableHeaderText, styles.col2]}>Qty</Text>
                        <Text style={[styles.tableHeaderText, styles.col3]}>Unit Price</Text>
                        <Text style={[styles.tableHeaderText, styles.col4]}>Amount</Text>
                    </View>
                    {data.items.map((item, index) => (
                        <View key={index} style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}>
                            <View style={styles.col1}>
                                <Text style={styles.tableCellBold}>{item.description}</Text>
                                {item.details && <Text style={styles.itemDetails}>{item.details}</Text>}
                            </View>
                            <Text style={[styles.tableCell, styles.col2]}>{item.quantity}</Text>
                            <Text style={[styles.tableCell, styles.col3]}>{formatCurrency(item.unitPrice)}</Text>
                            <Text style={[styles.tableCellBold, styles.col4]}>{formatCurrency(item.total)}</Text>
                        </View>
                    ))}
                </View>

                {/* Totals */}
                <View style={styles.totalsContainer}>
                    <View style={styles.totalsSection}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Subtotal</Text>
                            <Text style={styles.totalValue}>{formatCurrency(data.subtotal)}</Text>
                        </View>

                        {data.discount && data.discount > 0 && (
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Discount</Text>
                                <Text style={[styles.totalValue, { color: '#10b981' }]}>-{formatCurrency(data.discount)}</Text>
                            </View>
                        )}

                        {data.gstEnabled && data.tax !== undefined && data.tax > 0 && (
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>GST ({data.taxRate || 18}%)</Text>
                                <Text style={styles.totalValue}>{formatCurrency(data.tax)}</Text>
                            </View>
                        )}

                        <View style={styles.grandTotalRow}>
                            <Text style={styles.grandTotalLabel}>Total</Text>
                            <Text style={styles.grandTotalValue}>{formatCurrency(data.total)}</Text>
                        </View>

                        {data.gstEnabled && data.gstNumber && (
                            <View style={styles.gstNotice}>
                                <Text style={styles.gstText}>* Prices are inclusive of GST</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.footerContent}>
                        <Text style={styles.thankYou}>Thank you for your business!</Text>
                        <Text style={styles.footerText}>
                            For queries, contact us at {data.companyEmail || 'support@webinarpro.com'}
                        </Text>
                        {data.companyPhone && (
                            <Text style={styles.footerText}>Phone: {data.companyPhone}</Text>
                        )}
                    </View>
                </View>
            </Page>
        </Document>
    )
}
