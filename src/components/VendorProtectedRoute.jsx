'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function VendorProtectedRoute({ children }) {
    const router = useRouter()
    const [authorized, setAuthorized] = useState(false)
    const [checked, setChecked] = useState(false)

    useEffect(() => {
        const isVendorLoggedIn = localStorage.getItem('vendorLoggedIn')

        if (isVendorLoggedIn) {
            setAuthorized(true)
        } else {
            router.push('/vendor-login')
        }
        setChecked(true)
    }, [router])

    if (!checked) return null

    return authorized ? children : null
}
