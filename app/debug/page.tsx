import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function DebugPage() {
  const supabase = await createClient()

  // Test events query
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('*')

  // Test profiles query
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')

  // Test menu items query
  const { data: menuItems, error: menuError } = await supabase
    .from('menu_items')
    .select('*')

  // Test the join query
  const { data: eventsWithProfiles, error: joinError } = await supabase
    .from('events')
    .select(`
      *,
      profiles:organizer_id (full_name)
    `)

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8">Database Debug Page</h1>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Events (simple query)</h2>
          {eventsError ? (
            <div className="text-red-600">
              <strong>Error:</strong> {eventsError.message}
            </div>
          ) : (
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(events, null, 2)}
            </pre>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Events with Profiles (join query)</h2>
          {joinError ? (
            <div className="text-red-600">
              <strong>Error:</strong> {joinError.message}
            </div>
          ) : (
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(eventsWithProfiles, null, 2)}
            </pre>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Profiles</h2>
          {profilesError ? (
            <div className="text-red-600">
              <strong>Error:</strong> {profilesError.message}
            </div>
          ) : (
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(profiles, null, 2)}
            </pre>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Menu Items</h2>
          {menuError ? (
            <div className="text-red-600">
              <strong>Error:</strong> {menuError.message}
            </div>
          ) : (
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(menuItems, null, 2)}
            </pre>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Environment Variables</h2>
          <div className="space-y-2">
            <p>
              <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>{' '}
              {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Not set'}
            </p>
            <p>
              <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>{' '}
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Not set'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
