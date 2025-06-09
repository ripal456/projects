import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "EcoTrack",
  description: "Track your energy usage",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
