import { Card, CardContent } from "@/components/ui/card";

type Benefit = {
	title: string;
	description: string;
};

type WhyUsSectionProps = {
	eyebrow: string;
	title: string;
	description: string;
	benefits: Benefit[];
};

export function WhyUsSection({ eyebrow, title, description, benefits }: WhyUsSectionProps) {
	return (
		<section id="why-us" className="scroll-mt-24 border-border/60 border-b py-20">
			<div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
				<div className="flex max-w-xl flex-col gap-3">
					<p className="font-medium text-muted-foreground text-sm uppercase">{eyebrow}</p>
					<h2 className="font-semibold text-3xl tracking-tight sm:text-4xl">{title}</h2>
					<p className="text-muted-foreground leading-7">{description}</p>
				</div>
				<div className="grid gap-4">
					{benefits.map((benefit, index) => (
						<Card
							className="rounded-lg border border-border p-5 ring-0 [--card-spacing:--spacing(0)]"
							key={benefit.title}
						>
							<CardContent className="flex gap-4 px-0">
								<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm">
									{index + 1}
								</div>
								<div>
									<h3 className="font-semibold">{benefit.title}</h3>
									<p className="mt-1 text-muted-foreground text-sm leading-6">
										{benefit.description}
									</p>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}
