import { Button } from "@/components/ui/button";

type SiteHeaderProps = {
	brandName: string;
	navServices: string;
	navWhyUs: string;
	navContact: string;
	navCta: string;
};

export function SiteHeader({
	brandName,
	navServices,
	navWhyUs,
	navContact,
	navCta,
}: SiteHeaderProps) {
	return (
		<header className="sticky top-0 z-20 border-border/70 border-b bg-background/95 backdrop-blur">
			<nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
				<a className="font-semibold text-base" href="#hero">
					{brandName}
				</a>
				<div className="hidden items-center gap-6 text-muted-foreground text-sm md:flex">
					<a className="transition-colors hover:text-foreground" href="#services">
						{navServices}
					</a>
					<a className="transition-colors hover:text-foreground" href="#why-us">
						{navWhyUs}
					</a>
					<a className="transition-colors hover:text-foreground" href="#contact">
						{navContact}
					</a>
				</div>
				<Button asChild className="h-10 rounded-md px-4 shadow-sm">
					<a href="#contact">{navCta}</a>
				</Button>
			</nav>
		</header>
	);
}
