'use client'

import { useState, useRef } from 'react'

interface ImageUploadProps {
    value?: string
    onChange: (url: string) => void
    folder?: string
    label?: string
    aspectRatio?: 'square' | 'video' | 'banner'
    className?: string
}

export default function ImageUpload({
    value,
    onChange,
    folder = 'uploads',
    label = 'Upload Image',
    aspectRatio = 'video',
    className = ''
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')
    const [dragOver, setDragOver] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const aspectClasses = {
        square: 'aspect-square',
        video: 'aspect-video',
        banner: 'aspect-[3/1]'
    }

    const handleUpload = async (file: File) => {
        if (!file) return

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if (!allowedTypes.includes(file.type)) {
            setError('Only JPEG, PNG, WebP, and GIF files are allowed')
            return
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB')
            return
        }

        setUploading(true)
        setError('')

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('folder', folder)

            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Upload failed')
            }

            onChange(data.url)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed')
        } finally {
            setUploading(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleUpload(file)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files?.[0]
        if (file) {
            handleUpload(file)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(true)
    }

    const handleDragLeave = () => {
        setDragOver(false)
    }

    const handleRemove = () => {
        onChange('')
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className={className}>
            <label className="form-label">{label}</label>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
            />

            {value ? (
                // Image Preview
                <div className={`relative rounded-xl overflow-hidden border border-white/10 ${aspectClasses[aspectRatio]}`}>
                    <img
                        src={value}
                        alt="Uploaded"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                            title="Replace image"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="p-2 rounded-lg bg-red-500/50 hover:bg-red-500/70 text-white transition-colors"
                            title="Remove image"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                    {uploading && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        </div>
                    )}
                </div>
            ) : (
                // Upload Area
                <div
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`
                        ${aspectClasses[aspectRatio]} 
                        rounded-xl border-2 border-dashed 
                        ${dragOver ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/20 hover:border-white/40'}
                        ${uploading ? 'cursor-wait' : 'cursor-pointer'}
                        transition-colors flex flex-col items-center justify-center gap-3
                    `}
                >
                    {uploading ? (
                        <>
                            <div className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                            <span className="text-white/50 text-sm">Uploading...</span>
                        </>
                    ) : (
                        <>
                            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center">
                                <svg className="w-6 h-6 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="text-center">
                                <span className="text-white/70 text-sm">Click to upload</span>
                                <span className="text-white/40 text-sm mx-1">or drag and drop</span>
                            </div>
                            <span className="text-white/30 text-xs">PNG, JPG, WebP, GIF up to 5MB</span>
                        </>
                    )}
                </div>
            )}

            {error && (
                <p className="mt-2 text-red-400 text-sm">{error}</p>
            )}
        </div>
    )
}
