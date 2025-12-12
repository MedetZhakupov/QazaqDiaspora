'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { getEventRegistrations } from '@/app/[locale]/events/actions'

interface DownloadRegistrationsButtonProps {
  eventId: string
  locale: string
}

export function DownloadRegistrationsButton({ eventId, locale }: DownloadRegistrationsButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const downloadCSV = async () => {
    try {
      setIsDownloading(true)

      // Fetch registrations
      const result = await getEventRegistrations(eventId)

      if ('error' in result) {
        alert(result.error)
        return
      }

      const { data, eventTitle } = result

      if (!data || data.length === 0) {
        alert(locale === 'kk' ? 'Тіркелгендер жоқ' : 'No registrations found')
        return
      }

      // Convert to CSV
      const headers = ['Full Name', 'Email', 'Guest Count', 'Total People', 'Food Selections', 'Registered At']
      const rows = data.map(reg => {
        const foodItems = reg.foodSelections
          .map(f => `${f.name} (${f.quantity})`)
          .join('; ')

        const totalPeople = 1 + reg.guestCount // registrant + guests

        return [
          reg.fullName,
          reg.email,
          reg.guestCount.toString(),
          totalPeople.toString(),
          foodItems || 'None',
          new Date(reg.registeredAt).toLocaleString()
        ]
      })

      // Calculate totals
      const totalRegistrations = data.length
      const totalPeople = data.reduce((sum, reg) => sum + 1 + reg.guestCount, 0)

      // Add summary rows
      rows.push([])
      rows.push(['SUMMARY', '', '', '', '', ''])
      rows.push(['Total Registrations', totalRegistrations.toString(), '', '', '', ''])
      rows.push(['Total People', totalPeople.toString(), '', '', '', ''])

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      link.setAttribute('download', `${eventTitle.replace(/[^a-z0-9]/gi, '_')}_registrations.csv`)
      link.style.visibility = 'hidden'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error downloading registrations:', error)
      alert(locale === 'kk' ? 'Жүктеу кезінде қате орын алды' : 'Error downloading registrations')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <button
      onClick={downloadCSV}
      disabled={isDownloading}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <Download className="w-4 h-4" />
      {isDownloading
        ? (locale === 'kk' ? 'Жүктелуде...' : 'Downloading...')
        : (locale === 'kk' ? 'Тіркелгендерді жүктеу' : 'Download Registrations')
      }
    </button>
  )
}
