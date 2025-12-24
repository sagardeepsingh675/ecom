'use client'

import { useState } from 'react'

interface ContactFormData {
    name: string
    email: string
    phone?: string
    subject?: string
    message: string
}

export function useContactForm() {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const submitForm = async (data: ContactFormData) => {
        setLoading(true)
        setSuccess(false)
        setError(null)

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to submit form')
            }

            setSuccess(true)
            return result
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Something went wrong'
            setError(errorMessage)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const reset = () => {
        setSuccess(false)
        setError(null)
    }

    return { submitForm, loading, success, error, reset }
}
