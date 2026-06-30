type SiteFooterProps = {
	brandName: string;
	rights: string;
};

export function SiteFooter({ brandName, rights }: SiteFooterProps) {
	return (
		<footer className="border-border/60 border-t">
			<div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-muted-foreground text-sm sm:flex-row sm:items-center sm:justify-between">
				<p>
					{brandName} · {rights}
				</p>
			</div>
		</footer>
	);
}
