import "./globals.css";
import { Providers } from "@/lib/providers";

export const metadata = {
  title: "NexusChain - Blockchain Supply Chain Tracker",
  description: "Real-time, immutable tracking from factory to customer",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}