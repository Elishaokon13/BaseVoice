import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import { JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css";
import { headers } from "next/headers";
import ContextProvider from "@/context";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const coinbaseSans = Inter({
  subsets: ['latin'],
  variable: '--font-coinbase',
})

const coinbaseMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-coinbase-mono',
});

export const metadata: Metadata = {
  title: "BaseVoice | Secure Anonymous Feedback",
  description: "Submit and view encrypted anonymous feedback securely on Base network",
  icons: {
    icon: '/favicon.ico',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  const headersList = await headers()
  const cookies = headersList.get('cookie')

  return (
    <html lang="en" suppressHydrationWarning>


      <body
        className={`${coinbaseSans.variable} ${coinbaseMono.variable} antialiased bg-background text-foreground`}
      >

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ContextProvider cookies={cookies}>

            <Navbar />
            {children}
            <Footer />

          </ContextProvider>
        </ThemeProvider>

      </body>


    </html >
  );
}