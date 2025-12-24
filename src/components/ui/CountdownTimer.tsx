'use client'

import { useState, useEffect } from 'react'
import { getTimeRemaining } from '@/lib/utils'

interface CountdownTimerProps {
    targetDate: Date
    className?: string
}

export default function CountdownTimer({ targetDate, className = '' }: CountdownTimerProps) {
    const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(targetDate))

    useEffect(() => {
        const timer = setInterval(() => {
            const remaining = getTimeRemaining(targetDate)
            setTimeRemaining(remaining)

            if (remaining.total <= 0) {
                clearInterval(timer)
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [targetDate])

    if (timeRemaining.total <= 0) {
        return (
            <div className={`text-center ${className}`}>
                <span className="text-xl font-bold text-green-400">🎉 Event Started!</span>
            </div>
        )
    }

    return (
        <div className={`countdown-container ${className}`}>
            <div className="countdown-item glass-card p-4">
                <div className="countdown-value">{String(timeRemaining.days).padStart(2, '0')}</div>
                <div className="countdown-label">Days</div>
            </div>
            <div className="countdown-item glass-card p-4">
                <div className="countdown-value">{String(timeRemaining.hours).padStart(2, '0')}</div>
                <div className="countdown-label">Hours</div>
            </div>
            <div className="countdown-item glass-card p-4">
                <div className="countdown-value">{String(timeRemaining.minutes).padStart(2, '0')}</div>
                <div className="countdown-label">Minutes</div>
            </div>
            <div className="countdown-item glass-card p-4">
                <div className="countdown-value">{String(timeRemaining.seconds).padStart(2, '0')}</div>
                <div className="countdown-label">Seconds</div>
            </div>
        </div>
    )
}
