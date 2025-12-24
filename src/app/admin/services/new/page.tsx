'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import ImageUpload from '@/components/admin/ImageUpload'

export default function NewService() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        short_description: '',
        description: '',
        category: 'sales_boost',
        price: 0,
        original_price: 0,
        features: [''],
        icon_url: '',
        image_url: '',
        is_active: true,
        is_featured: false,
    })

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        const checked = (e.target as HTMLInputElement).checked

        setFormData(prev => {
            const newData = {
                ...prev,
                [name]: type === 'checkbox' ? checked :
                    type === 'number' ? Number(value) : value
            }

            if (name === 'name') {
                newData.slug = generateSlug(value)
            }

            return newData
        })
        setError('')
    }

    const handleImageChange = (field: string) => (url: string) => {
        setFormData(prev => ({ ...prev, [field]: url }))
    }

    const handleFeatureChange = (index: number, value: string) => {
        const newFeatures = [...formData.features]
        newFeatures[index] = value
        setFormData({ ...formData, features: newFeatures })
    }

    const addFeature = () => {
        setFormData({ ...formData, features: [...formData.features, ''] })
    }

    const removeFeature = (index: number) => {
        setFormData({
            ...formData,
            features: formData.features.filter((_, i) => i !== index)
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const supabase = createClient()

            const { error: insertError } = await supabase
                .from('services')
                .insert({
                    ...formData,
                    features: formData.features.filter(f => f.trim() !== ''),
                })

            if (insertError) throw insertError

            router.push('/admin/services')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create service')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl">
            <div className="mb-6">
                <Link href="/admin/services" className="text-white/50 hover:text-white text-sm inline-flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Services
                </Link>
            </div>

            <div className="glass-card p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Create New Service</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="form-group md:col-span-2">
                            <label className="form-label">Service Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="form-input"
                                placeholder="e.g., Sales Boost Package - Pro"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">URL Slug</label>
                            <input
                                type="text"
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="form-input"
                            >
                                <option value="sales_boost">Sales Boost</option>
                                <option value="marketing">Marketing</option>
                                <option value="consulting">Consulting</option>
                                <option value="training">Training</option>
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label className="form-label">Short Description</label>
                        <input
                            type="text"
                            name="short_description"
                            value={formData.short_description}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Brief description for cards"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Full Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="form-input resize-none"
                        />
                    </div>

                    {/* Service Images */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <ImageUpload
                            value={formData.icon_url}
                            onChange={handleImageChange('icon_url')}
                            folder="services"
                            label="Service Icon"
                            aspectRatio="square"
                        />

                        <ImageUpload
                            value={formData.image_url}
                            onChange={handleImageChange('image_url')}
                            folder="services"
                            label="Service Image"
                            aspectRatio="video"
                        />
                    </div>

                    {/* Pricing */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="form-group">
                            <label className="form-label">Price (₹) *</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                min="0"
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Original Price (₹)</label>
                            <input
                                type="number"
                                name="original_price"
                                value={formData.original_price}
                                onChange={handleChange}
                                min="0"
                                className="form-input"
                            />
                        </div>
                    </div>

                    {/* Features */}
                    <div className="form-group">
                        <label className="form-label">Features</label>
                        <div className="space-y-2">
                            {formData.features.map((feature, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={feature}
                                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                                        className="form-input flex-1"
                                        placeholder="Feature description"
                                    />
                                    {formData.features.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeFeature(index)}
                                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addFeature}
                                className="text-sm text-indigo-400 hover:text-indigo-300"
                            >
                                + Add Feature
                            </button>
                        </div>
                    </div>

                    {/* Options */}
                    <div className="flex gap-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                                className="w-5 h-5 rounded border-white/20 bg-white/10 text-indigo-500"
                            />
                            <span className="text-white">Active</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="is_featured"
                                checked={formData.is_featured}
                                onChange={handleChange}
                                className="w-5 h-5 rounded border-white/20 bg-white/10 text-indigo-500"
                            />
                            <span className="text-white">Featured</span>
                        </label>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <button type="submit" disabled={loading} className="btn btn-primary">
                            {loading ? 'Creating...' : 'Create Service'}
                        </button>
                        <Link href="/admin/services" className="btn btn-secondary">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
