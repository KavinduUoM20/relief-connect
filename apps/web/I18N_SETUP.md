# Internationalization (i18n) Setup

## Overview
The application now supports 3 languages:
- **English** (en) - Default
- **Sinhala** (si) - සිංහල
- **Tamil** (ta) - தமிழ்

## Installation

Install the required dependencies:
```bash
cd apps/web
yarn install
```

This will install:
- `next-i18next` - Next.js i18n integration
- `i18next` - Core i18n library
- `react-i18next` - React bindings for i18next

## Configuration

### Files Created/Modified:

1. **`next-i18next.config.js`** - i18n configuration
   - Default locale: `en`
   - Supported locales: `en`, `si`, `ta`
   - Auto-detection enabled

2. **Translation Files**:
   - `public/locales/en/common.json` - English translations
   - `public/locales/si/common.json` - Sinhala translations
   - `public/locales/ta/common.json` - Tamil translations

3. **Components**:
   - `src/components/LanguageSwitcher.tsx` - Language selector dropdown
   - Updated `src/pages/_app.tsx` - Wrapped with `appWithTranslation`
   - Updated `src/pages/index.tsx` - Added `getServerSideProps` for i18n
   - Updated `src/pages/map.tsx` - Added translations
   - Updated `src/components/LandingPage.tsx` - All text now uses translations

## Usage

### In Components

```tsx
import { useTranslation } from 'next-i18next';

function MyComponent() {
  const { t } = useTranslation('common');
  
  return <h1>{t('appName')}</h1>;
}
```

### In Pages

Add `getServerSideProps`:

```tsx
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
}
```

### Language Switcher

The `LanguageSwitcher` component is already added to the landing page header. It displays:
- Globe icon
- Current language in native script
- Dropdown to select language

## Adding New Translations

1. Add the key to all three language files:
   - `public/locales/en/common.json`
   - `public/locales/si/common.json`
   - `public/locales/ta/common.json`

2. Use in components:
   ```tsx
   const { t } = useTranslation('common');
   <p>{t('yourNewKey')}</p>
   ```

## Language Detection

The app automatically detects the user's preferred language from:
1. Browser language settings
2. Previously selected language (stored in cookies)
3. Falls back to English if not available

## URL Structure

Languages are handled via Next.js locale routing:
- `/` - Default locale (English)
- `/si` - Sinhala
- `/ta` - Tamil

The language switcher updates the URL and maintains the current page.

## Current Translation Coverage

The following components/pages have been translated:
- ✅ Landing Page (all text)
- ✅ Map Page (filters and labels)
- ✅ Language Switcher
- ⚠️ Forms (HelpRequestForm, CampForm, etc.) - Still need translation keys added

## Next Steps

To complete i18n coverage:
1. Add translation keys for form components
2. Translate error messages
3. Add translations for validation messages
4. Consider adding more translation namespaces (e.g., `forms`, `errors`)

## Notes

- Sinhala and Tamil scripts are properly supported
- Text direction is LTR for all languages (Tamil is LTR, not RTL)
- Font rendering should work correctly with Unicode characters

