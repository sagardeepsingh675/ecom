'use client'

import { useState, useEffect } from 'react'

// Sample testimonials data (in production, this would come from database)
const testimonials = [
    {
        id: 1,
        name: 'Priya Mehta',
        role: 'Marketing Manager',
        company: 'TechStart India',
        image: null,
        rating: 5,
        text: 'The digital marketing webinar was a game-changer for our startup. We implemented the strategies and saw a 40% increase in leads within just 2 months!',
    },
    {
        id: 2,
        name: 'Rahul Kapoor',
        role: 'Entrepreneur',
        company: 'KapoorTech',
        image: null,
        rating: 5,
        text: 'The Sales Boost package exceeded my expectations. The team provided actionable insights that directly impacted our revenue. Highly recommended!',
    },
    {
        id: 3,
        name: 'Anjali Sharma',
        role: 'Freelance Designer',
        company: 'Self-employed',
        image: null,
        rating: 5,
        text: 'As a freelancer, the mentorship session was exactly what I needed. Got clarity on pricing, client management, and scaling my business.',
    },
    {
        id: 4,
        name: 'Vikram Singh',
        role: 'CEO',
        company: 'GrowFast Solutions',
        image: null,
        rating: 5,
        text: 'We registered our entire team for the AI webinar. The practical approach made it easy for everyone to understand and apply AI in their daily work.',
    },
    {
        id: 5,
        name: 'Neha Gupta',
        role: 'Product Manager',
        company: 'InnovateTech',
        image: null,
        rating: 5,
        text: 'The financial freedom webinar opened my eyes to investment strategies I never knew existed. Already started building my portfolio!',
    },
    {
        id: 6,
        name: 'Arjun Reddy',
        role: 'Startup Founder',
        company: 'RedStart',
        image: null,
        rating: 5,
        text: 'The enterprise package transformed our entire sales process. Our conversion rate improved by 60% and the ROI was incredible.',
    },
]

export default function TestimonialsSection() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)

    // Auto-scroll testimonials
    useEffect(() => {
        if (!isAutoPlaying) return

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % testimonials.length)
        }, 5000)

        return () => clearInterval(interval)
    }, [isAutoPlaying])

    const goToSlide = (index: number) => {
        setCurrentIndex(index)
        setIsAutoPlaying(false)
    }

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length)
        setIsAutoPlaying(false)
    }

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
        setIsAutoPlaying(false)
    }

    return (
        <section id="testimonials" className="section relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-indigo-950/10 to-[#0a0a0f]" />

            {/* Decorative orbs */}
            <div className="glow-orb glow-orb-primary w-64 h-64 -bottom-32 -left-32 opacity-20" />
            <div className="glow-orb glow-orb-secondary w-48 h-48 top-20 -right-24 opacity-20" />

            <div className="container mx-auto relative z-10">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <span className="badge badge-primary mb-4">💬 Testimonials</span>
                    <h2 className="section-title">
                        What Our <span className="gradient-text">Students Say</span>
                    </h2>
                    <p className="section-subtitle">
                        Real stories from real people who transformed their careers with us
                    </p>
                </div>

                {/* Testimonials Slider */}
                <div className="max-w-4xl mx-auto">
                    {/* Main Testimonial Card */}
                    <div className="glass-card p-8 md:p-12 text-center mb-8 animate-scale-in">
                        {/* Quote Icon */}
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                            </svg>
                        </div>

                        {/* Rating */}
                        <div className="flex justify-center gap-1 mb-6">
                            {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                                <svg key={i} className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                            ))}
                        </div>

                        {/* Testimonial Text */}
                        <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                            "{testimonials[currentIndex].text}"
                        </p>

                        {/* Author */}
                        <div className="flex items-center justify-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                                {testimonials[currentIndex].name.charAt(0)}
                            </div>
                            <div className="text-left">
                                <div className="font-semibold text-white text-lg">
                                    {testimonials[currentIndex].name}
                                </div>
                                <div className="text-white/50">
                                    {testimonials[currentIndex].role}, {testimonials[currentIndex].company}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-center gap-4">
                        {/* Prev Button */}
                        <button
                            onClick={prevSlide}
                            className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        {/* Dots */}
                        <div className="flex gap-2">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className={`w-2.5 h-2.5 rounded-full transition-all ${index === currentIndex
                                            ? 'bg-indigo-500 w-8'
                                            : 'bg-white/20 hover:bg-white/40'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Next Button */}
                        <button
                            onClick={nextSlide}
                            className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
                    {[
                        { value: '10,000+', label: 'Students Trained' },
                        { value: '4.9/5', label: 'Average Rating' },
                        { value: '50+', label: 'Expert Instructors' },
                        { value: '95%', label: 'Satisfaction Rate' },
                    ].map((stat, index) => (
                        <div
                            key={index}
                            className="text-center p-6 glass-card animate-slide-up"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="text-3xl md:text-4xl font-black gradient-text mb-2">
                                {stat.value}
                            </div>
                            <div className="text-white/50 text-sm">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
