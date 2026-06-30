import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactSection } from "@/components/marketing/contact-section";
import { HeroSection } from "@/components/marketing/hero-section";
import { ServicesSection } from "@/components/marketing/services-section";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { WhyUsSection } from "@/components/marketing/why-us-section";
import type { Locale } from "@/i18n/routing";

type HomePageProps = {
	params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
	const { locale } = await params;
	setRequestLocale(locale as Locale);

	const t = await getTranslations("HomePage");
	const services = [
		{
			title: t("service1Title"),
			description: t("service1Description"),
		},
		{
			title: t("service2Title"),
			description: t("service2Description"),
		},
		{
			title: t("service3Title"),
			description: t("service3Description"),
		},
	];
	const benefits = [
		{
			title: t("benefit1Title"),
			description: t("benefit1Description"),
		},
		{
			title: t("benefit2Title"),
			description: t("benefit2Description"),
		},
		{
			title: t("benefit3Title"),
			description: t("benefit3Description"),
		},
	];

	return (
		<main id="main-content" className="min-h-screen bg-background text-foreground">
			<a
				className="sr-only z-30 rounded-md bg-background px-4 py-2 text-foreground shadow-sm focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
				href="#main-content"
			>
				{t("skipToContent")}
			</a>
			<SiteHeader
				brandName={t("brandName")}
				navServices={t("navServices")}
				navWhyUs={t("navWhyUs")}
				navContact={t("navContact")}
				navCta={t("navCta")}
			/>
			<HeroSection
				eyebrow={t("eyebrow")}
				heroTitle={t("heroTitle")}
				heroDescription={t("heroDescription")}
				primaryCta={t("primaryCta")}
				secondaryCta={t("secondaryCta")}
				heroCardLabel={t("heroCardLabel")}
				heroCardTitle={t("heroCardTitle")}
				heroCardDescription={t("heroCardDescription")}
				heroDetail1Title={t("heroDetail1Title")}
				heroDetail1Text={t("heroDetail1Text")}
				heroDetail2Title={t("heroDetail2Title")}
				heroDetail2Text={t("heroDetail2Text")}
			/>
			<ServicesSection
				eyebrow={t("servicesEyebrow")}
				title={t("servicesTitle")}
				description={t("servicesDescription")}
				services={services}
			/>
			<WhyUsSection
				eyebrow={t("whyEyebrow")}
				title={t("whyTitle")}
				description={t("whyDescription")}
				benefits={benefits}
			/>
			<ContactSection
				eyebrow={t("contactEyebrow")}
				title={t("contactTitle")}
				description={t("contactDescription")}
			/>
			<SiteFooter brandName={t("footerBrand")} rights={t("footerRights")} />
		</main>
	);
}
