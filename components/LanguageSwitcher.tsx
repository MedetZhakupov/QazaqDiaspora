'use client'

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { locales } from '@/i18n';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    // Remove current locale from pathname if it exists
    const pathWithoutLocale = pathname.replace(/^\/(kk|en)/, '');
    // Build new path with new locale
    const newPath = `/${newLocale}${pathWithoutLocale}`;
    router.push(newPath);
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-xl border border-gray-300">
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          className={`px-3 py-1 rounded-lg font-medium transition ${
            locale === loc
              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          {loc === 'kk' ? 'ҚАЗ' : 'ENG'}
        </button>
      ))}
    </div>
  );
}
