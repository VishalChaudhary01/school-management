import '@/styles/globals.css';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <Toaster richColors />
      <Component {...pageProps} />
    </SessionProvider>
  );
}
