# Language Switcher Fix

## Changes Made

1. **Updated `next.config.ts`**:
   - Added i18n configuration from `next-i18next.config.js`
   - This ensures Next.js knows about the supported locales

2. **Updated `LanguageSwitcher.tsx`**:
   - Changed to use `router.push(router.pathname, router.asPath, { locale })`
   - This is the recommended approach for next-i18next
   - The locale change will trigger `getServerSideProps` to reload translations

## How It Works

When a user selects a language:
1. `handleLanguageChange` is called with the new locale
2. `router.push` updates the URL with the new locale
3. Next.js detects the locale change and calls `getServerSideProps` with the new locale
4. `serverSideTranslations` loads the correct translation file
5. The component re-renders with the new translations

## Testing

1. Start the dev server:
   ```bash
   cd apps/web
   yarn dev
   ```

2. Open the app in browser
3. Click the language switcher in the header
4. Select a different language (සිංහල or தமிழ்)
5. The page should reload and show translations in the selected language

## Troubleshooting

If the language still doesn't change:

1. **Check browser console** for errors
2. **Verify translation files exist**:
   - `public/locales/en/common.json`
   - `public/locales/si/common.json`
   - `public/locales/ta/common.json`

3. **Check Next.js config**:
   - Ensure `next.config.ts` has the i18n config
   - Restart the dev server after config changes

4. **Clear browser cache**:
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   - Or clear browser cache

5. **Check network tab**:
   - Verify translation files are being loaded
   - Check for 404 errors on locale files

## Expected Behavior

- URL should change to include locale (e.g., `/si` or `/ta`)
- Page should reload with new translations
- All text should update to the selected language
- Language switcher should show the current language

## Notes

- The page will reload when changing languages (this is expected behavior)
- Translations are loaded server-side via `getServerSideProps`
- The locale is stored in the URL, so it persists on page refresh

