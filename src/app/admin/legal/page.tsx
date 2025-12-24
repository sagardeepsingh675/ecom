'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface LegalPage {
    id: string
    slug: string
    title: string
    content: string
    last_updated: string
}

export default function AdminLegalPages() {
    const [pages, setPages] = useState<LegalPage[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [selectedPage, setSelectedPage] = useState<LegalPage | null>(null)
    const [editContent, setEditContent] = useState('')
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    useEffect(() => {
        fetchPages()
    }, [])

    const fetchPages = async () => {
        try {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('legal_pages')
                .select('*')
                .order('title', { ascending: true })

            if (error) throw error
            setPages(data || [])

            // Auto-select first page
            if (data && data.length > 0 && !selectedPage) {
                setSelectedPage(data[0])
                setEditContent(data[0].content)
            }
        } catch (error) {
            console.error('Error fetching pages:', error)
            setMessage({ type: 'error', text: 'Failed to load pages' })
        } finally {
            setLoading(false)
        }
    }

    const handleSelectPage = (page: LegalPage) => {
        setSelectedPage(page)
        setEditContent(page.content)
        setMessage(null)
    }

    const handleSave = async () => {
        if (!selectedPage) return

        setSaving(true)
        setMessage(null)

        try {
            const supabase = createClient()
            const { error } = await supabase
                .from('legal_pages')
                .update({
                    content: editContent,
                    last_updated: new Date().toISOString(),
                })
                .eq('id', selectedPage.id)

            if (error) throw error

            setMessage({ type: 'success', text: `${selectedPage.title} updated successfully!` })

            // Update local state
            setPages(pages.map(p =>
                p.id === selectedPage.id
                    ? { ...p, content: editContent, last_updated: new Date().toISOString() }
                    : p
            ))
            setSelectedPage({ ...selectedPage, content: editContent, last_updated: new Date().toISOString() })
        } catch (error: any) {
            console.error('Error saving page:', error)
            setMessage({ type: 'error', text: error.message || 'Failed to save' })
        } finally {
            setSaving(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-white">Legal Pages</h2>
                <p className="text-white/50">Edit Privacy Policy, Terms of Service, and Refund Policy</p>
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

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Page Selector */}
                    <div className="lg:col-span-1 space-y-2">
                        {pages.map(page => (
                            <button
                                key={page.id}
                                onClick={() => handleSelectPage(page)}
                                className={`w-full text-left p-4 rounded-xl transition-all ${selectedPage?.id === page.id
                                        ? 'bg-indigo-500/20 border border-indigo-500/50'
                                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                    }`}
                            >
                                <div className="font-medium text-white">{page.title}</div>
                                <div className="text-xs text-white/50 mt-1">
                                    Updated: {formatDate(page.last_updated)}
                                </div>
                            </button>
                        ))}

                        {/* Preview Link */}
                        {selectedPage && (
                            <a
                                href={`/legal/${selectedPage.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all mt-4"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Preview Page
                            </a>
                        )}
                    </div>

                    {/* Editor */}
                    <div className="lg:col-span-3">
                        {selectedPage ? (
                            <div className="glass-card p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-semibold text-white">
                                        Edit {selectedPage.title}
                                    </h3>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="btn btn-primary"
                                    >
                                        {saving ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
                                    <div className="flex items-start gap-2 text-indigo-300 text-sm">
                                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>
                                            Content supports <strong>Markdown</strong> formatting. Use ## for headings, **bold**, *italic*, - for lists, etc.
                                        </span>
                                    </div>
                                </div>

                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="form-input min-h-[500px] font-mono text-sm"
                                    placeholder="Enter page content in Markdown format..."
                                />

                                <div className="text-white/40 text-sm">
                                    Page URL: <code className="px-2 py-1 rounded bg-white/10">/legal/{selectedPage.slug}</code>
                                </div>
                            </div>
                        ) : (
                            <div className="glass-card p-12 text-center text-white/50">
                                Select a page to edit
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
