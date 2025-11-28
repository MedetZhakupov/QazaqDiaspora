import createMiddleware from 'next-intl/middleware';
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { locales, defaultLocale } from './i18n';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

export async function middleware(request: NextRequest) {
  // First, update the Supabase session
  const supabaseResponse = await updateSession(request);

  // Then run i18n middleware
  const intlResponse = intlMiddleware(request);

  // Merge Supabase cookies into the intl response
  supabaseResponse.cookies.getAll().forEach(cookie => {
    intlResponse.cookies.set(cookie.name, cookie.value, cookie);
  });

  return intlResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
