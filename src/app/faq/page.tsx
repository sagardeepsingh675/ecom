'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

interface FAQ {
    id: string
    question: string
    answer: string
    category: string
    display_order: number
}

export default function FAQPage() {
    const [faqs, setFaqs] = useState<FAQ[]>([])
    const [loading, setLoading] = useState(true)
    const [openId, setOpenId] = useState<string | null>(null)
    const [activeCategory, setActiveCategory] = useState<string>('All')

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const supabase = createClient()
                const { data, error } = await supabase
                    .from('faqs')
                    .select('*')
                    .eq('is_active', true)
                    .order('display_order', { ascending: true })

                if (error) throw error
                setFaqs(data || [])
            } catch (error) {
                console.error('Error fetching FAQs:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchFaqs()
    }, [])

    const categories = ['All', ...Array.from(new Set(faqs.map(f => f.category)))]
    const filteredFaqs = activeCategory === 'All'
        ? faqs
        : faqs.filter(f => f.category === activeCategory)

    const toggleFaq = (id: string) => {
        setOpenId(openId === id ? null : id)
    }

    return (
        <>
            <Header />
            <main className="min-h-screen pt-24 pb-16">
                {/* Hero Section */}
                <section className="py-16 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent" />
                    <div className="container relative z-10">
                        <div className="text-center max-w-3xl mx-auto">
                            <span className="badge badge-glow mb-4">Help Center</span>
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                Frequently Asked <span className="gradient-text">Questions</span>
                            </h1>
                            <p className="text-xl text-white/60">
                                Find answers to common questions about our webinars, registration, payments, and more.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Category Filter */}
                <section className="py-8">
                    <div className="container">
                        <div className="flex flex-wrap gap-2 justify-center">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setActiveCategory(category)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === category
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ List */}
                <section className="py-8">
                    <div className="container max-w-3xl">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : filteredFaqs.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-white/50">No FAQs found in this category.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredFaqs.map((faq, index) => (
                                    <div
                                        key={faq.id}
                                        className="glass-card overflow-hidden transition-all duration-300"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <button
                                            onClick={() => toggleFaq(faq.id)}
                                            className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                                        >
                                            <div className="flex items-start gap-4">
                                                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                                    {index + 1}
                                                </span>
                                                <span className="text-white font-medium text-lg">
                                                    {faq.question}
                                                </span>
                                            </div>
                                            <svg
                                                className={`w-6 h-6 text-white/50 transition-transform duration-300 ${openId === faq.id ? 'rotate-180' : ''
                                                    }`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        <div
                                            className={`overflow-hidden transition-all duration-300 ${openId === faq.id ? 'max-h-96' : 'max-h-0'
                                                }`}
                                        >
                                            <div className="px-6 pb-6 pl-[4.5rem]">
                                                <p className="text-white/70 leading-relaxed">
                                                    {faq.answer}
                                                </p>
                                                <span className="inline-block mt-3 text-xs px-2 py-1 rounded-full bg-white/10 text-white/50">
                                                    {faq.category}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Contact CTA */}
                <section className="py-16">
                    <div className="container max-w-3xl">
                        <div className="glass-card p-8 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10" />
                            <div className="relative z-10">
                                <h2 className="text-2xl font-bold text-white mb-3">
                                    Still have questions?
                                </h2>
                                <p className="text-white/60 mb-6">
                                    Can't find the answer you're looking for? Our support team is here to help.
                                </p>
                                <a
                                    href="/#contact"
                                    className="btn btn-primary inline-flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    Contact Support
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}
