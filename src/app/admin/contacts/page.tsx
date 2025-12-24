'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'

interface ContactLead {
    id: string
    name: string
    email: string
    phone: string | null
    subject: string | null
    message: string
    is_read: boolean
    created_at: string
}

export default function AdminContacts() {
    const [contacts, setContacts] = useState<ContactLead[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedContact, setSelectedContact] = useState<ContactLead | null>(null)

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const supabase = createClient()
                const { data, error } = await supabase
                    .from('contact_leads')
                    .select('*')
                    .order('created_at', { ascending: false })

                if (error) throw error
                setContacts(data || [])
            } catch (error) {
                console.error('Error fetching contacts:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchContacts()
    }, [])

    const toggleRead = async (id: string, currentIsRead: boolean) => {
        try {
            const supabase = createClient()
            const newIsRead = !currentIsRead
            const { error } = await supabase
                .from('contact_leads')
                .update({ is_read: newIsRead })
                .eq('id', id)

            if (error) throw error

            setContacts(contacts.map(c => c.id === id ? { ...c, is_read: newIsRead } : c))
            if (selectedContact?.id === id) {
                setSelectedContact({ ...selectedContact, is_read: newIsRead })
            }
        } catch (error) {
            console.error('Error updating read status:', error)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white">Contact Leads</h2>
                <p className="text-white/50">View and manage contact form submissions</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* List */}
                <div className="lg:col-span-2 glass-card p-4 max-h-[600px] overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                        </div>
                    ) : contacts.length === 0 ? (
                        <div className="text-center py-12 text-white/50">No contact leads yet</div>
                    ) : (
                        <div className="space-y-2">
                            {contacts.map((contact) => (
                                <button
                                    key={contact.id}
                                    onClick={() => setSelectedContact(contact)}
                                    className={`w-full text-left p-4 rounded-xl transition-all ${selectedContact?.id === contact.id
                                        ? 'bg-indigo-500/20 border border-indigo-500/30'
                                        : 'hover:bg-white/5'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-white truncate">{contact.name}</span>
                                                {!contact.is_read && (
                                                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                                                )}
                                            </div>
                                            <div className="text-sm text-white/50 truncate">{contact.email}</div>
                                            <div className="text-sm text-white/40 truncate mt-1">
                                                {contact.subject || contact.message.slice(0, 50)}...
                                            </div>
                                        </div>
                                        <div className="text-xs text-white/40 flex-shrink-0 ml-4">
                                            {formatDate(contact.created_at, { month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Detail */}
                <div className="glass-card p-6">
                    {selectedContact ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-white">{selectedContact.name}</h3>
                                <button
                                    onClick={() => toggleRead(selectedContact.id, selectedContact.is_read)}
                                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${selectedContact.is_read
                                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                        : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                                        }`}
                                >
                                    {selectedContact.is_read ? 'Read' : 'Unread'}
                                </button>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-2 text-white/70">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    {selectedContact.email}
                                </div>
                                {selectedContact.phone && (
                                    <div className="flex items-center gap-2 text-white/70">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        {selectedContact.phone}
                                    </div>
                                )}
                                <div className="text-white/50">
                                    {formatDate(selectedContact.created_at, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                </div>
                            </div>

                            {selectedContact.subject && (
                                <div className="pt-4 border-t border-white/10">
                                    <div className="text-white/50 text-xs uppercase mb-1">Subject</div>
                                    <div className="text-white">{selectedContact.subject}</div>
                                </div>
                            )}

                            <div className="pt-4 border-t border-white/10">
                                <div className="text-white/50 text-xs uppercase mb-1">Message</div>
                                <div className="text-white/80 whitespace-pre-wrap">{selectedContact.message}</div>
                            </div>

                            <div className="pt-4 flex gap-2">
                                <a
                                    href={`mailto:${selectedContact.email}`}
                                    className="btn btn-primary btn-sm flex-1"
                                >
                                    Reply
                                </a>
                                {selectedContact.phone && (
                                    <a
                                        href={`tel:${selectedContact.phone}`}
                                        className="btn btn-secondary btn-sm flex-1"
                                    >
                                        Call
                                    </a>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-white/40 py-12">
                            Select a contact to view details
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
