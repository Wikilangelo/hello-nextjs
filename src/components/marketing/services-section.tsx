import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Service = {
	title: string;
	description: string;
};

type ServicesSectionProps = {
	eyebrow: string;
	title: string;
	description: string;
	services: Service[];
};

export function ServicesSection({ eyebrow, title, description, services }: ServicesSectionProps) {
	return (
		<section id="services" className="scroll-mt-24 border-border/60 border-b bg-muted/25 py-20">
			<div className="mx-auto max-w-6xl px-6">
				<div className="flex max-w-2xl flex-col gap-3">
					<p className="font-medium text-muted-foreground text-sm uppercase">{eyebrow}</p>
					<h2 className="font-semibold text-3xl tracking-tight sm:text-4xl">{title}</h2>
					<p className="text-muted-foreground leading-7">{description}</p>
				</div>
				<div className="mt-10 grid gap-4 md:grid-cols-3">
					{services.map((service) => (
						<Card
							className="rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm ring-0 [--card-spacing:--spacing(0)]"
							key={service.title}
						>
							<CardHeader className="px-0">
								<CardTitle className="font-semibold text-lg" role="heading" aria-level={3}>
									{service.title}
								</CardTitle>
							</CardHeader>
							<CardContent className="px-0">
								<CardDescription className="mt-3 text-muted-foreground text-sm leading-6">
									{service.description}
								</CardDescription>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}
