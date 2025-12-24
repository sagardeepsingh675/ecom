'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface FAQ {
    id: string
    question: string
    answer: string
    category: string
    display_order: number
    is_active: boolean
    created_at: string
}

const defaultFaq = {
    question: '',
    answer: '',
    category: 'General',
    display_order: 0,
    is_active: true,
}

export default function AdminFAQs() {
    const [faqs, setFaqs] = useState<FAQ[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState(defaultFaq)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const categories = ['General', 'Registration', 'Payments', 'Certificates', 'Attendance', 'Technical', 'Recording', 'Support']

    useEffect(() => {
        fetchFaqs()
    }, [])

    const fetchFaqs = async () => {
        try {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('faqs')
                .select('*')
                .order('display_order', { ascending: true })

            if (error) throw error
            setFaqs(data || [])
        } catch (error) {
            console.error('Error fetching FAQs:', error)
            setMessage({ type: 'error', text: 'Failed to load FAQs' })
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage(null)

        try {
            const supabase = createClient()

            if (editingId) {
                const { error } = await supabase
                    .from('faqs')
                    .update({
                        question: formData.question,
                        answer: formData.answer,
                        category: formData.category,
                        display_order: formData.display_order,
                        is_active: formData.is_active,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', editingId)

                if (error) throw error
                setMessage({ type: 'success', text: 'FAQ updated successfully!' })
            } else {
                const { error } = await supabase
                    .from('faqs')
                    .insert([formData])

                if (error) throw error
                setMessage({ type: 'success', text: 'FAQ created successfully!' })
            }

            setFormData(defaultFaq)
            setEditingId(null)
            setShowForm(false)
            fetchFaqs()
        } catch (error: any) {
            console.error('Error saving FAQ:', error)
            setMessage({ type: 'error', text: error.message || 'Failed to save FAQ' })
        } finally {
            setSaving(false)
        }
    }

    const handleEdit = (faq: FAQ) => {
        setFormData({
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            display_order: faq.display_order,
            is_active: faq.is_active,
        })
        setEditingId(faq.id)
        setShowForm(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this FAQ?')) return

        try {
            const supabase = createClient()
            const { error } = await supabase
                .from('faqs')
                .delete()
                .eq('id', id)

            if (error) throw error
            setMessage({ type: 'success', text: 'FAQ deleted successfully!' })
            fetchFaqs()
        } catch (error: any) {
            console.error('Error deleting FAQ:', error)
            setMessage({ type: 'error', text: error.message || 'Failed to delete FAQ' })
        }
    }

    const toggleActive = async (faq: FAQ) => {
        try {
            const supabase = createClient()
            const { error } = await supabase
                .from('faqs')
                .update({ is_active: !faq.is_active })
                .eq('id', faq.id)

            if (error) throw error
            fetchFaqs()
        } catch (error) {
            console.error('Error toggling FAQ:', error)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">FAQs</h2>
                    <p className="text-white/50">Manage frequently asked questions</p>
                </div>
                <button
                    onClick={() => {
                        setFormData(defaultFaq)
                        setEditingId(null)
                        setShowForm(!showForm)
                    }}
                    className="btn btn-primary"
                >
                    {showForm ? 'Cancel' : '+ Add FAQ'}
                </button>
            </div>

            {/* Message */}
            {message && (
                <div className={`p-4 rounded-lg ${message.type === 'success'
                        ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                        : 'bg-red-500/10 border border-red-500/30 text-red-400'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Form */}
            {showForm && (
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        {editingId ? 'Edit FAQ' : 'Add New FAQ'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="form-group">
                            <label className="form-label">Question *</label>
                            <input
                                type="text"
                                value={formData.question}
                                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                className="form-input"
                                required
                                placeholder="Enter the question"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Answer *</label>
                            <textarea
                                value={formData.answer}
                                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                                className="form-input min-h-[120px]"
                                required
                                placeholder="Enter the answer"
                            />
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="form-input"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Display Order</label>
                                <input
                                    type="number"
                                    value={formData.display_order}
                                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                                    className="form-input"
                                    min="0"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <label className="flex items-center gap-2 mt-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="w-5 h-5 rounded"
                                    />
                                    <span className="text-white">Active</span>
                                </label>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={saving}
                                className="btn btn-primary"
                            >
                                {saving ? 'Saving...' : editingId ? 'Update FAQ' : 'Create FAQ'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false)
                                    setEditingId(null)
                                    setFormData(defaultFaq)
                                }}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* FAQ List */}
            <div className="glass-card overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                ) : faqs.length === 0 ? (
                    <div className="p-8 text-center text-white/50">
                        No FAQs found. Create your first one!
                    </div>
                ) : (
                    <div className="divide-y divide-white/10">
                        {faqs.map((faq, index) => (
                            <div key={faq.id} className="p-4 hover:bg-white/5 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3 flex-1">
                                        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-medium text-sm">
                                            {index + 1}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-white font-medium">{faq.question}</h4>
                                            <p className="text-white/50 text-sm mt-1 line-clamp-2">{faq.answer}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                                                    {faq.category}
                                                </span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${faq.is_active
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {faq.is_active ? 'Active' : 'Hidden'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleActive(faq)}
                                            className={`p-2 rounded-lg transition-colors ${faq.is_active
                                                    ? 'text-green-400 hover:bg-green-500/20'
                                                    : 'text-white/40 hover:bg-white/10'
                                                }`}
                                            title={faq.is_active ? 'Hide' : 'Show'}
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                {faq.is_active ? (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                ) : (
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                )}
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleEdit(faq)}
                                            className="p-2 rounded-lg text-white/40 hover:text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                                            title="Edit"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(faq.id)}
                                            className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/20 transition-colors"
                                            title="Delete"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
