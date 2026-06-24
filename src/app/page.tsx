import { submitContact } from "@/actions/contact";
import { ContactForm } from "@/components/forms/contact-form";

export default function Home() {
	return (
		<main className="min-h-screen bg-muted/30">
			<div className="mx-auto grid min-h-screen max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,40rem)] lg:items-center">
				<section className="max-w-2xl space-y-6">
					<p className="text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground">
						Customer Template
					</p>
					<div className="space-y-4">
						<h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
							Start from a lean form-ready SaaS baseline.
						</h1>
						<p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
							This template ships with a reusable contact workflow, typed validation, and a small
							shadcn/ui surface that can scale into customer-facing intake flows without extra
							client state or provider setup.
						</p>
					</div>
					<ul className="space-y-3 text-sm text-muted-foreground sm:text-base">
						<li>Typed Zod schema for request validation</li>
						<li>Reusable UI primitives for cards, inputs, textareas, and buttons</li>
						<li>React Hook Form wiring isolated to a single client component boundary</li>
					</ul>
				</section>
				<section className="flex justify-center lg:justify-end">
					<ContactForm onSubmit={submitContact} />
				</section>
			</div>
		</main>
	);
}
