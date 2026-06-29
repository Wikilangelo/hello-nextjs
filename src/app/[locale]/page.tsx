import { getTranslations, setRequestLocale } from "next-intl/server";
import { submitContact } from "@/actions/contact";
import { ContactForm } from "@/components/forms/contact-form";
import type { Locale } from "@/i18n/routing";

type HomePageProps = {
	params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
	const { locale } = await params;
	setRequestLocale(locale as Locale);

	const t = await getTranslations("HomePage");

	return (
		<main className="min-h-screen bg-muted/30">
			<div className="mx-auto grid min-h-screen max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,40rem)] lg:items-center">
				<section className="max-w-2xl space-y-6">
					<p className="text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground">
						{t("badge")}
					</p>
					<div className="space-y-4">
						<h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
							{t("heading")}
						</h1>
						<p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
							{t("description")}
						</p>
					</div>
					<ul className="space-y-3 text-sm text-muted-foreground sm:text-base">
						<li>{t("feature1")}</li>
						<li>{t("feature2")}</li>
						<li>{t("feature3")}</li>
					</ul>
				</section>
				<section className="flex justify-center lg:justify-end">
					<ContactForm onSubmit={submitContact} />
				</section>
			</div>
		</main>
	);
}
