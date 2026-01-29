'use server'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

export async function sendTelegramNotification(message: string) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.warn('Telegram credentials not found in environment variables')
        return { success: false, error: 'Telegram configuration missing' }
    }

    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            }),
        })

        const data = await response.json()

        if (!data.ok) {
            console.error('Telegram API Error:', data)
            return { success: false, error: data.description }
        }

        return { success: true, data }
    } catch (error) {
        console.error('Failed to send Telegram notification:', error)
        return { success: false, error: 'Network error' }
    }
}
