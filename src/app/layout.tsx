import type { Metadata } from "next";
import { themeInitialization } from "../lib/color-theme";
import "./globals.css";
import "./themes.css";
import "./navigation.css";
export const metadata: Metadata = { title: "PursuitsHQ", description: "A personal workspace for job applications, verified outcomes, pipeline analytics, and your next move." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en" suppressHydrationWarning><head><script id="theme-initialization" dangerouslySetInnerHTML={{ __html: themeInitialization("pursuitshq.color-theme") }} /></head><body>{children}</body></html>; }
