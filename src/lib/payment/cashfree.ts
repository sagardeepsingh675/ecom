import { Cashfree } from 'cashfree-pg'

// Get credentials from environment
const appId = process.env.CASHFREE_APP_ID || ''
const secretKey = process.env.CASHFREE_SECRET_KEY || ''
const isProduction = process.env.CASHFREE_ENV === 'production'

// Check if we should run in demo mode
export const DEMO_MODE = !appId || process.env.CASHFREE_DEMO_MODE === 'true'

// Create Cashfree instance (SDK v5 syntax)
let cashfreeInstance: any = null

function getCashfreeInstance() {
    if (!cashfreeInstance && appId && secretKey) {
        try {
            // SDK v5: new Cashfree(environment, appId, secretKey)
            const environment = isProduction ? Cashfree.PRODUCTION : Cashfree.SANDBOX
            cashfreeInstance = new Cashfree(environment, appId, secretKey)
            console.log('Cashfree initialized:', { isProduction, hasInstance: !!cashfreeInstance })
        } catch (e) {
            console.error('Failed to initialize Cashfree:', e)
        }
    }
    return cashfreeInstance
}

export interface CreateOrderParams {
    orderId: string
    orderAmount: number
    orderCurrency?: string
    customerDetails: {
        customerId: string
        customerEmail: string
        customerPhone?: string
        customerName?: string
    }
    orderMeta?: {
        returnUrl?: string
        notifyUrl?: string
    }
    orderNote?: string
}

export interface CashfreeOrderResponse {
    cfOrderId: string
    orderId: string
    orderStatus: string
    paymentSessionId: string
    orderExpiryTime: string
}

export interface PaymentVerification {
    orderId: string
    orderAmount: number
    orderStatus: string
    cfOrderId: string
    cfPaymentId?: string
    paymentMethod?: string
    paymentTime?: string
    paymentStatus?: string
}

/**
 * Create a Cashfree payment order
 */
export async function createCashfreeOrder(params: CreateOrderParams): Promise<{
    success: boolean
    demoMode?: boolean
    data?: CashfreeOrderResponse
    error?: string
}> {
    // Demo mode - simulate payment
    if (DEMO_MODE) {
        console.log('Cashfree running in DEMO mode')
        return {
            success: true,
            demoMode: true,
            data: {
                cfOrderId: `CF_DEMO_${Date.now()}`,
                orderId: params.orderId,
                orderStatus: 'ACTIVE',
                paymentSessionId: `session_demo_${Date.now()}`,
                orderExpiryTime: new Date(Date.now() + 30 * 60 * 1000).toISOString()
            }
        }
    }

    const cashfree = getCashfreeInstance()
    if (!cashfree) {
        console.error('Cashfree instance not available')
        return { success: false, error: 'Payment gateway not configured' }
    }

    try {
        const request = {
            order_id: params.orderId,
            order_amount: params.orderAmount,
            order_currency: params.orderCurrency || 'INR',
            customer_details: {
                customer_id: params.customerDetails.customerId,
                customer_email: params.customerDetails.customerEmail,
                customer_phone: params.customerDetails.customerPhone || '9999999999',
                customer_name: params.customerDetails.customerName || 'Customer'
            },
            order_meta: {
                return_url: params.orderMeta?.returnUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/payment/callback?order_id={order_id}`,
                notify_url: params.orderMeta?.notifyUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/webhook`
            },
            order_note: params.orderNote || ''
        }

        console.log('Creating Cashfree order:', request.order_id)
        const response = await cashfree.PGCreateOrder(request)
        console.log('Cashfree response:', response.data)

        if (response.data) {
            return {
                success: true,
                data: {
                    cfOrderId: response.data.cf_order_id || '',
                    orderId: response.data.order_id || params.orderId,
                    orderStatus: response.data.order_status || 'ACTIVE',
                    paymentSessionId: response.data.payment_session_id || '',
                    orderExpiryTime: response.data.order_expiry_time || ''
                }
            }
        }

        return { success: false, error: 'Failed to create order' }
    } catch (error: any) {
        console.error('Cashfree create order error:', error)
        const errorMessage = error?.response?.data?.message || error?.message || 'Payment gateway error'
        return {
            success: false,
            error: errorMessage
        }
    }
}

/**
 * Verify payment status
 */
export async function verifyPayment(orderId: string): Promise<{
    success: boolean
    demoMode?: boolean
    data?: PaymentVerification
    error?: string
}> {
    // Demo mode
    if (DEMO_MODE) {
        return {
            success: true,
            demoMode: true,
            data: {
                orderId,
                orderAmount: 0,
                orderStatus: 'PAID',
                cfOrderId: `CF_DEMO_${orderId}`,
                cfPaymentId: `PAY_DEMO_${Date.now()}`,
                paymentStatus: 'SUCCESS',
                paymentTime: new Date().toISOString()
            }
        }
    }

    const cashfree = getCashfreeInstance()
    if (!cashfree) {
        return { success: false, error: 'Payment gateway not configured' }
    }

    try {
        const response = await cashfree.PGOrderFetchPayments(orderId)

        if (response.data && response.data.length > 0) {
            const payment = response.data[0]
            return {
                success: true,
                data: {
                    orderId: orderId,
                    orderAmount: payment.payment_amount || 0,
                    orderStatus: payment.payment_status === 'SUCCESS' ? 'PAID' : payment.payment_status || 'UNKNOWN',
                    cfOrderId: payment.cf_order_id?.toString() || '',
                    cfPaymentId: payment.cf_payment_id?.toString() || '',
                    paymentMethod: payment.payment_method?.toString() || '',
                    paymentTime: payment.payment_completion_time || '',
                    paymentStatus: payment.payment_status || ''
                }
            }
        }

        // Check order status if no payments found
        const orderResponse = await cashfree.PGFetchOrder(orderId)

        if (orderResponse.data) {
            return {
                success: true,
                data: {
                    orderId: orderId,
                    orderAmount: orderResponse.data.order_amount || 0,
                    orderStatus: orderResponse.data.order_status || 'UNKNOWN',
                    cfOrderId: orderResponse.data.cf_order_id || ''
                }
            }
        }

        return { success: false, error: 'Order not found' }
    } catch (error: any) {
        console.error('Cashfree verify payment error:', error)
        return {
            success: false,
            error: error?.response?.data?.message || error?.message || 'Verification failed'
        }
    }
}

/**
 * Get order status
 */
export async function getOrderStatus(orderId: string): Promise<{
    success: boolean
    status?: string
    error?: string
}> {
    if (DEMO_MODE) {
        return { success: true, status: 'PAID' }
    }

    const cashfree = getCashfreeInstance()
    if (!cashfree) {
        return { success: false, error: 'Payment gateway not configured' }
    }

    try {
        const response = await cashfree.PGFetchOrder(orderId)

        if (response.data) {
            return {
                success: true,
                status: response.data.order_status
            }
        }

        return { success: false, error: 'Order not found' }
    } catch (error: any) {
        console.error('Cashfree get order status error:', error)
        return {
            success: false,
            error: error?.response?.data?.message || error?.message || 'Failed to get status'
        }
    }
}
