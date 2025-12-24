'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ReactMarkdown from 'react-markdown'

interface LegalPage {
    id: string
    slug: string
    title: string
    content: string
    last_updated: string
}

export default function LegalPageView() {
    const params = useParams()
    const slug = params.slug as string
    const [page, setPage] = useState<LegalPage | null>(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const supabase = createClient()
                const { data, error } = await supabase
                    .from('legal_pages')
                    .select('*')
                    .eq('slug', slug)
                    .single()

                if (error || !data) {
                    setNotFound(true)
                } else {
                    setPage(data)
                }
            } catch (error) {
                console.error('Error fetching legal page:', error)
                setNotFound(true)
            } finally {
                setLoading(false)
            }
        }

        if (slug) {
            fetchPage()
        }
    }, [slug])

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    return (
        <>
            <Header />
            <main className="min-h-screen pt-24 pb-16">
                <div className="container max-w-4xl">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : notFound ? (
                        <div className="text-center py-20">
                            <h1 className="text-4xl font-bold text-white mb-4">Page Not Found</h1>
                            <p className="text-white/60">The requested page could not be found.</p>
                        </div>
                    ) : page ? (
                        <div className="glass-card p-8 md:p-12">
                            <div className="mb-8 pb-6 border-b border-white/10">
                                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                    {page.title}
                                </h1>
                                <p className="text-white/50 text-sm">
                                    Last updated: {formatDate(page.last_updated)}
                                </p>
                            </div>

                            <div className="prose prose-invert prose-lg max-w-none
                                prose-headings:text-white prose-headings:font-bold
                                prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                                prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                                prose-p:text-white/70 prose-p:leading-relaxed
                                prose-ul:text-white/70 prose-ol:text-white/70
                                prose-li:my-1
                                prose-strong:text-white prose-strong:font-semibold
                                prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
                            ">
                                <ReactMarkdown>{page.content}</ReactMarkdown>
                            </div>
                        </div>
                    ) : null}
                </div>
            </main>
            <Footer />
        </>
    )
}
