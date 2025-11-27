# Қазақ Диаспорасы - Іс-шараларды басқару платформасы

A modern event management platform built with Next.js and Supabase for the Qazaq diaspora community, featuring a beautiful Kazakh language interface.

## ✨ Features

- **Admin-only Event Creation**: Only designated administrators can create and manage events
- **Potluck Menu System**: Event organizers can create food/menu lists, attendees must select what they'll bring
- **User Registration**: All authenticated users can register for events (after selecting menu items)
- **Kazakh Language Interface**: Full UI in Kazakh language
- **Modern Design**: Beautiful gradient-based UI with smooth animations
- **Authentication**: Secure authentication with Supabase Auth
- **Real-time Updates**: Live event data, registration counts, and menu availability
- **Email Notifications**: Automatic confirmation emails to attendees and organizers
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works great)

### Setup Instructions

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up Supabase**

   a. Go to [supabase.com](https://supabase.com) and create a new project

   b. Once your project is ready, go to Settings > API to find your project URL and anon key

   c. Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env.local
   ```

   Then edit `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   RESEND_API_KEY=your-resend-api-key
   ```

   **Note:**
   - `SUPABASE_SERVICE_ROLE_KEY` is needed to send emails to event organizers (found in Settings > API)
   - `RESEND_API_KEY` is needed for sending confirmation emails (get it from [resend.com](https://resend.com))

3. **Set up the database schema**

   **If you're setting up a fresh database (new project):**

   a. Go to your Supabase project dashboard

   b. Navigate to SQL Editor

   c. Copy the contents of `supabase-schema.sql` and run it in the SQL Editor

   **If you already have the database set up (existing project):**

   a. Go to your Supabase project dashboard

   b. Navigate to SQL Editor

   c. Copy the contents of `supabase-migration-admin.sql` and run it in the SQL Editor

   This will add the admin role system to your existing database.

4. **Add the menu/potluck system**

   Run the menu migration to add menu functionality:

   a. Go to your Supabase project dashboard

   b. Navigate to SQL Editor

   c. Copy the contents of `supabase-menu-migration.sql` and run it

5. **Make your first user an admin**

   After signing up your first account, you need to make it an admin to create events:

   a. Go to your Supabase project dashboard

   b. Navigate to Authentication > Users and copy your user ID

   c. Go to SQL Editor and run:
   ```sql
   UPDATE public.profiles
   SET is_admin = true
   WHERE id = 'YOUR_USER_ID_HERE';
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 👤 Admin vs Regular Users

### Administrators Can:
- Create new events with menu items (potluck list)
- Edit their own events
- Delete their own events
- View all events and registrations
- See who is bringing what food items

### Regular Users Can:
- View all events and available menu items
- Register for events by selecting menu items they'll bring
- Cancel their registrations
- View their registered events and their menu commitments

Only users with `is_admin = true` in the profiles table can access the event creation functionality.

## 🍽️ Potluck Menu System

The platform includes a unique potluck/menu system:

1. **Event Creation**: Admins can add menu items when creating events (e.g., "Беспармақ × 3", "Самса × 5")
2. **Registration Requirement**: Users must select at least one menu item to bring before they can register
3. **Real-time Availability**: The system tracks how many of each item have been claimed
4. **Visual Indicators**: Progress bars show how many portions of each dish are spoken for
5. **Commitment Tracking**: Registered users can see what they committed to bring

## 📧 Email Notifications

When a user registers for an event, the system automatically sends:

1. **Confirmation Email to Attendee**:
   - Event details (title, date, time, location)
   - List of food items they committed to bring
   - Beautiful HTML email in Kazakh language

2. **Notification Email to Organizer**:
   - New attendee's name and email
   - Food items the attendee will bring
   - Updated total registration count
   - Helps organizers track who's bringing what

### Email Setup

To enable email notifications:

1. **Sign up for Resend** (free tier: 3,000 emails/month)
   - Go to [resend.com](https://resend.com) and create an account
   - Create an API key from the dashboard
   - Add it to your `.env.local` as `RESEND_API_KEY`

2. **Add Supabase Service Role Key**
   - Go to your Supabase project Settings > API
   - Copy the `service_role` key (⚠️ Keep this secret!)
   - Add it to your `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`

3. **Configure Resend Domain** (optional, for production)
   - By default, emails come from `onboarding@resend.dev`
   - For production, verify your own domain in Resend
   - Update the `from` address in `app/events/actions.ts`

**Note**: If `RESEND_API_KEY` is not set, registrations will still work but no emails will be sent. Errors are logged to the console.

## Project Structure

```
.
├── app/                  # Next.js app directory
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles
├── lib/
│   └── supabase/        # Supabase client configuration
│       ├── client.ts    # Browser client
│       ├── server.ts    # Server client
│       └── middleware.ts # Middleware helpers
├── middleware.ts        # Next.js middleware for auth
└── supabase-schema.sql  # Database schema
```

## Database Schema

The application uses the following main tables:

- **events**: Store event information (title, description, dates, location, etc.)
- **event_registrations**: Track user registrations for events
- **profiles**: Store additional user profile information including admin status (`is_admin`)
- **menu_items**: Store food/menu items for each event
- **menu_claims**: Track which users are bringing which menu items

Row Level Security (RLS) is enabled with the following policies:
- Only admins can create, update, and delete events and menu items
- All users can view events and menu items
- Users can register for events and claim menu items
- Users can cancel their own registrations (which also removes their menu claims)
- Event organizers can view registrations and menu claims for their events

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (recommended)

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

MIT
