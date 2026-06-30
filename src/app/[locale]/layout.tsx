import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import "../globals.css";
import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

const geistSans = localFont({
	src: "../fonts/geist-sans.woff2",
	display: "swap",
	fallback: ["system-ui", "sans-serif"],
	adjustFontFallback: "Arial",
	variable: "--font-geist-sans",
});

const geistMono = localFont({
	src: "../fonts/geist-mono.woff2",
	display: "swap",
	fallback: ["ui-monospace", "SFMono-Regular", "monospace"],
	adjustFontFallback: false,
	variable: "--font-geist-mono",
});

export const metadata: Metadata = {
	metadataBase: siteConfig.url,
	title: {
		default: siteConfig.name,
		template: `%s | ${siteConfig.name}`,
	},
	description: siteConfig.description,
	openGraph: {
		title: siteConfig.name,
		description: siteConfig.description,
		type: "website",
		url: siteConfig.url,
	},
	robots: {
		index: true,
		follow: true,
	},
};

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#ffffff" },
		{ media: "(prefers-color-scheme: dark)", color: "#171717" },
	],
};

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

type LocaleLayoutProps = {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
	const { locale } = await params;

	if (!routing.locales.includes(locale as Locale)) {
		notFound();
	}

	setRequestLocale(locale);

	const messages = await getMessages();

	return (
		<html
			lang={locale}
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
		>
			<body className="flex min-h-full flex-col">
				<NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
			</body>
		</html>
	);
}
