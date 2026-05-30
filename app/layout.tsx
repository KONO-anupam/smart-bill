// app/layout
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | SmartBill",
    default: "SmartBill — Send Invoices in 60 Seconds",
  },
  description:
    "The fastest way for freelancers to create, send, and get paid on professional invoices. No templates, no setup — just paste and send.",
  keywords: [
    "invoice generator",
    "freelance invoicing",
    "send invoice online",
    "invoice automation",
    "get paid faster",
    "invoice tool for freelancers",
  ],
  openGraph: {
    type: "website",
    siteName: "SmartBill",
    title: "SmartBill — Send Invoices in 60 Seconds",
    description:
      "The fastest way for freelancers to create, send, and get paid on professional invoices. No templates, no setup — just paste and send.",
    url: "https://smartbill.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartBill — Send Invoices in 60 Seconds",
    description:
      "The fastest way for freelancers to create, send, and get paid on professional invoices. No templates, no setup — just paste and send.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}