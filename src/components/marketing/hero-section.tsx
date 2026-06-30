import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type HeroSectionProps = {
	eyebrow: string;
	heroTitle: string;
	heroDescription: string;
	primaryCta: string;
	secondaryCta: string;
	heroCardLabel: string;
	heroCardTitle: string;
	heroCardDescription: string;
	heroDetail1Title: string;
	heroDetail1Text: string;
	heroDetail2Title: string;
	heroDetail2Text: string;
};

export function HeroSection({
	eyebrow,
	heroTitle,
	heroDescription,
	primaryCta,
	secondaryCta,
	heroCardLabel,
	heroCardTitle,
	heroCardDescription,
	heroDetail1Title,
	heroDetail1Text,
	heroDetail2Title,
	heroDetail2Text,
}: HeroSectionProps) {
	return (
		<section id="hero" className="scroll-mt-24 border-border/60 border-b">
			<div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)] lg:items-center lg:py-28">
				<div className="flex max-w-3xl flex-col gap-8">
					<div className="flex flex-col gap-5">
						<p className="font-medium text-muted-foreground text-sm uppercase">{eyebrow}</p>
						<h1 className="text-balance font-semibold text-4xl tracking-tight sm:text-5xl lg:text-6xl">
							{heroTitle}
						</h1>
						<p className="max-w-2xl text-base text-muted-foreground leading-7 sm:text-lg">
							{heroDescription}
						</p>
					</div>
					<div className="flex flex-col gap-3 sm:flex-row">
						<Button asChild className="h-11 rounded-md px-5 shadow-sm">
							<a href="#contact">{primaryCta}</a>
						</Button>
						<Button asChild className="h-11 rounded-md px-5" variant="outline">
							<a href="#services">{secondaryCta}</a>
						</Button>
					</div>
				</div>

				<Card className="rounded-lg border border-border bg-muted/40 p-6 shadow-sm ring-0 [--card-spacing:--spacing(0)]">
					<CardContent className="flex flex-col gap-6 px-0">
						<p className="font-medium text-muted-foreground text-sm">{heroCardLabel}</p>
						<CardHeader className="gap-3 px-0">
							<CardTitle className="font-semibold text-2xl" role="heading" aria-level={2}>
								{heroCardTitle}
							</CardTitle>
							<CardDescription className="text-muted-foreground text-sm leading-6">
								{heroCardDescription}
							</CardDescription>
						</CardHeader>
						<div className="grid gap-3 text-sm sm:grid-cols-2">
							<Card className="rounded-md border border-border bg-background p-4 ring-0 [--card-spacing:--spacing(0)]">
								<CardContent className="px-0">
									<p className="font-medium">{heroDetail1Title}</p>
									<p className="mt-1 text-muted-foreground">{heroDetail1Text}</p>
								</CardContent>
							</Card>
							<Card className="rounded-md border border-border bg-background p-4 ring-0 [--card-spacing:--spacing(0)]">
								<CardContent className="px-0">
									<p className="font-medium">{heroDetail2Title}</p>
									<p className="mt-1 text-muted-foreground">{heroDetail2Text}</p>
								</CardContent>
							</Card>
						</div>
					</CardContent>
				</Card>
			</div>
		</section>
	);
}
