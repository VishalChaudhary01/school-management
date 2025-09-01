import { Html, Head, Main, NextScript } from 'next/document';
import { Toaster } from 'sonner';

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="antialiased ">
        <div className="w-full max-w-[1440px] mx-auto min-h-screen">
          <Toaster richColors />
          <Main />
        </div>
        <NextScript />
      </body>
    </Html>
  );
}
