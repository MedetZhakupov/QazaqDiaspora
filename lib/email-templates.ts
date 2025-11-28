type EventDetails = {
  title: string
  start_date: string
  end_date: string
  location?: string
  description?: string
}

type MenuClaim = {
  name: string
  quantity: number
}

export function getAttendeeConfirmationEmail(
  attendeeName: string,
  event: EventDetails,
  menuClaims: MenuClaim[]
) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('kk-KZ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const menuItemsList = menuClaims.length > 0
    ? `
      <h3 style="color: #1e40af; margin-top: 24px; margin-bottom: 12px;">Сіз әкелетін тағамдар:</h3>
      <ul style="list-style: none; padding: 0;">
        ${menuClaims.map(claim => `
          <li style="background: #f0f9ff; padding: 12px; margin: 8px 0; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <strong>${claim.name}</strong> × ${claim.quantity}
          </li>
        `).join('')}
      </ul>
    `
    : ''

  return {
    subject: `Тіркеу расталды: ${event.title}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(to right, #3b82f6, #6366f1); padding: 2px; border-radius: 12px;">
            <div style="background: white; padding: 32px; border-radius: 10px;">
              <h1 style="color: #1e40af; margin-top: 0;">Сәлеметсіз бе, ${attendeeName}!</h1>

              <p style="font-size: 16px; margin-bottom: 24px;">
                Сіз <strong>${event.title}</strong> іс-шарасына сәтті тіркелдіңіз.
              </p>

              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 24px 0;">
                <h2 style="color: #1e40af; margin-top: 0;">Іс-шара туралы:</h2>

                <p style="margin: 8px 0;">
                  <strong>📅 Күні мен уақыты:</strong><br/>
                  ${formatDate(event.start_date)}
                </p>

                ${event.location ? `
                  <p style="margin: 8px 0;">
                    <strong>📍 Орны:</strong><br/>
                    ${event.location}
                  </p>
                ` : ''}

                ${event.description ? `
                  <p style="margin: 16px 0 8px 0;">
                    <strong>Сипаттама:</strong><br/>
                    ${event.description}
                  </p>
                ` : ''}
              </div>

              ${menuItemsList}

              <div style="margin-top: 32px; padding-top: 24px; border-top: 2px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  Іс-шараға қатысуыңызды асыға күтеміз!
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `
  }
}

export function getOrganizerNotificationEmail(
  organizerName: string,
  attendeeName: string,
  attendeeEmail: string,
  event: EventDetails,
  menuClaims: MenuClaim[],
  guestCount: number,
  totalAttendees: number
) {
  const menuItemsList = menuClaims.length > 0
    ? `
      <h3 style="color: #1e40af; margin-top: 16px; margin-bottom: 8px;">Әкелетін тағамдары:</h3>
      <ul style="list-style: none; padding: 0;">
        ${menuClaims.map(claim => `
          <li style="background: #fef3c7; padding: 8px; margin: 4px 0; border-radius: 6px;">
            ${claim.name} × ${claim.quantity}
          </li>
        `).join('')}
      </ul>
    `
    : '<p style="color: #6b7280; font-style: italic;">Тағам таңдалмаған</p>'

  return {
    subject: `Жаңа тіркелу: ${event.title}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(to right, #10b981, #059669); padding: 2px; border-radius: 12px;">
            <div style="background: white; padding: 32px; border-radius: 10px;">
              <h1 style="color: #047857; margin-top: 0;">Сәлеметсіз бе, ${organizerName}!</h1>

              <p style="font-size: 16px; margin-bottom: 24px;">
                <strong>${event.title}</strong> іс-шарасына жаңа қатысушы тіркелді.
              </p>

              <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #10b981;">
                <h2 style="color: #047857; margin-top: 0; font-size: 18px;">Қатысушы туралы:</h2>

                <p style="margin: 8px 0;">
                  <strong>👤 Аты-жөні:</strong> ${attendeeName}
                </p>

                <p style="margin: 8px 0;">
                  <strong>📧 Email:</strong> ${attendeeEmail}
                </p>

                <p style="margin: 8px 0;">
                  <strong>👥 Қонақтар саны:</strong> ${guestCount}
                </p>

                <p style="margin: 8px 0;">
                  <strong>✅ Барлығы:</strong> ${1 + guestCount} адам (тіркелуші + ${guestCount} қонақ)
                </p>

                ${menuItemsList}
              </div>

              <div style="background: #eff6ff; padding: 16px; border-radius: 8px; margin-top: 24px;">
                <p style="margin: 0; color: #1e40af; font-size: 16px;">
                  <strong>Жалпы қатысушылар саны:</strong> ${totalAttendees}
                </p>
              </div>

              <div style="margin-top: 32px; padding-top: 24px; border-top: 2px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  Бұл хабарлама іс-шараңызға жаңа қатысушы тіркелгенде автоматты түрде жіберіледі.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `
  }
}
