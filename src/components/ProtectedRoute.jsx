'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProtectedRoute({ children }) {
    const router = useRouter()
    const [authorized, setAuthorized] = useState(false)
    const [checked, setChecked] = useState(false)

    useEffect(() => {
        // Check local storage only on client side
        const isLoggedIn = localStorage.getItem('isLoggedIn')
        const devMode = localStorage.getItem('devMode') === 'true'

        if (isLoggedIn || devMode) {
            setAuthorized(true)
        } else {
            router.push('/')
        }
        setChecked(true)
    }, [router])

    // Don't render anything while checking to prevent flash of content
    if (!checked) return null

    return authorized ? children : null
}
