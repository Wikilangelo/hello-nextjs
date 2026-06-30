import { submitContact } from "@/actions/contact";
import { ContactForm } from "@/components/forms/contact-form";

type ContactSectionProps = {
	eyebrow: string;
	title: string;
	description: string;
};

export function ContactSection({ eyebrow, title, description }: ContactSectionProps) {
	return (
		<section id="contact" className="scroll-mt-24 bg-muted/25 py-20">
			<div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(22rem,1fr)] lg:items-start">
				<div className="flex max-w-xl flex-col gap-4">
					<p className="font-medium text-muted-foreground text-sm uppercase">{eyebrow}</p>
					<h2 className="font-semibold text-3xl tracking-tight sm:text-4xl">{title}</h2>
					<p className="text-muted-foreground leading-7">{description}</p>
				</div>
				<div className="flex justify-center lg:justify-end">
					<ContactForm onSubmit={submitContact} />
				</div>
			</div>
		</section>
	);
}
