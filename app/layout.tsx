import type React from "react"
import { Roboto_Mono } from "next/font/google"
import "./globals.css"
import localFont from "next/font/local"
import ClientLayout from "./_client-layout"
import { ConvexClientProvider } from "@/components/convex-provider"

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
})

const rebelGrotesk = localFont({
  src: "../public/fonts/Rebels-Fett.woff2",
  variable: "--font-rebels",
  display: "swap",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preload" href="/fonts/Rebels-Fett.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <title>TL;DR Dashboard</title>
        <meta
          name="description"
          content="Too Long; Didn't Read - AI-powered research summarization and knowledge management assistant."
        />
      </head>
      <body className={`${rebelGrotesk.variable} ${robotoMono.variable} antialiased`}>
        <ConvexClientProvider>
          <ClientLayout>{children}</ClientLayout>
        </ConvexClientProvider>
      </body>
    </html>
  )
}

export const metadata = {
};
