import { Resend } from 'resend'

// Create Resend client only if API key is available
// This allows the app to work without email functionality
export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null
