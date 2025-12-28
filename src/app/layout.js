import { Inter, Outfit } from 'next/font/google'
import '../index.css'
import StyledComponentsRegistry from '../lib/registry'

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
})

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-outfit',
    display: 'swap',
})

export const metadata = {
    title: 'PLN VLAAS - Sistem Manajemen Aset',
    description: 'Platform Digital Terpadu untuk Manajemen Surat Vendor PT. PLN Persero - Vendor Letter Archive & Approval System',
    icons: {
        icon: '/images/Logo_vlaas.png',
    },
}

export default function RootLayout({ children }) {
    return (
        <html lang="id">
            <body className={`${inter.variable} ${outfit.variable}`}>
                <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
            </body>
        </html>
    )
}
