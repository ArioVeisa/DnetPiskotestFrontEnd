import "./globals.css";
import type { Metadata } from "next";
import LayoutClient from "./layoutClient";

export const metadata: Metadata = {
  title: "My App",
  description: "App with session handling",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
