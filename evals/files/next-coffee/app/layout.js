import "./globals.css";

export const metadata = { title: "Kopi Tani Roastery", description: "Small-batch coffee from Javanese highlands." };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
