import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { routing } from "@/i18n/routing";

export default function sitemap(): MetadataRoute.Sitemap {
	if (!siteConfig.url) {
		return [];
	}

	return routing.locales.map((locale) => ({
		url: new URL(locale === routing.defaultLocale ? "/" : `/${locale}`, siteConfig.url).toString(),
		lastModified: new Date(),
	}));
}
