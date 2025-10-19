import "./globals.css";

export const metadata = {
  title: "NexusChain - Blockchain Supply Chain Tracker",
  description: "Real-time, immutable tracking from factory to customer",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}