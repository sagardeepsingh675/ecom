'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import type { Service } from '@/types/database'

export default function AdminServices() {
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState<string | null>(null)

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const supabase = createClient()
                const { data, error } = await supabase
                    .from('services')
                    .select('*')
                    .order('created_at', { ascending: false })

                if (error) throw error
                setServices(data || [])
            } catch (error) {
                console.error('Error fetching services:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchServices()
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this service?')) return

        setDeleting(id)
        try {
            const supabase = createClient()
            const { error } = await supabase
                .from('services')
                .delete()
                .eq('id', id)

            if (error) throw error
            setServices(services.filter(s => s.id !== id))
        } catch (error) {
            console.error('Error deleting service:', error)
            alert('Failed to delete service')
        } finally {
            setDeleting(null)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Services</h2>
                    <p className="text-white/50">Manage your service packages</p>
                </div>
                <Link href="/admin/services/new" className="btn btn-primary">
                    + Add Service
                </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full flex justify-center py-12">
                        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    </div>
                ) : services.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-white/50">
                        No services found. Create your first service package!
                    </div>
                ) : (
                    services.map((service) => (
                        <div key={service.id} className="glass-card p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">{service.name}</h3>
                                    <p className="text-white/50 text-sm">{service.slug}</p>
                                </div>
                                <span className={`badge ${service.is_active ? 'badge-success' : 'badge-error'
                                    }`}>
                                    {service.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <p className="text-white/60 text-sm mb-4 line-clamp-2">
                                {service.short_description}
                            </p>

                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-2xl font-bold text-white">
                                    {formatCurrency(service.price)}
                                </span>
                                {service.original_price && service.original_price > service.price && (
                                    <span className="text-sm text-white/40 line-through">
                                        {formatCurrency(service.original_price)}
                                    </span>
                                )}
                            </div>

                            {service.features && (
                                <div className="mb-4">
                                    <div className="text-xs text-white/40 mb-2">Features:</div>
                                    <ul className="space-y-1">
                                        {(service.features as string[]).slice(0, 3).map((feature, idx) => (
                                            <li key={idx} className="text-sm text-white/60 flex items-center gap-1">
                                                <span className="text-green-400">✓</span> {feature}
                                            </li>
                                        ))}
                                        {(service.features as string[]).length > 3 && (
                                            <li className="text-sm text-white/40">
                                                +{(service.features as string[]).length - 3} more
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            )}

                            <div className="flex gap-2 pt-4 border-t border-white/10">
                                <Link
                                    href={`/admin/services/${service.id}/edit`}
                                    className="btn btn-secondary btn-sm flex-1"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(service.id)}
                                    disabled={deleting === service.id}
                                    className="btn btn-secondary btn-sm text-red-400 hover:bg-red-500/20"
                                >
                                    {deleting === service.id ? '...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
