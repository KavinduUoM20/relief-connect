import type { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import '../styles/globals.css';
import 'leaflet/dist/leaflet.css';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const locale = router.locale || 'en';
  
  return (
    <div lang={locale}>
      <Component {...pageProps} />
    </div>
  );
}

export default appWithTranslation(MyApp);
