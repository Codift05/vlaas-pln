import '../index.css'
import StyledComponentsRegistry from '../lib/registry'

export const metadata = {
    title: 'VLAAS',
    description: 'Vendor Letter Archive & Approval System',
}

export default function RootLayout({ children }) {
    return (
        <html lang="id">
            <body>
                <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
            </body>
        </html>
    )
}
