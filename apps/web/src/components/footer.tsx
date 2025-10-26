"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

type FooterLink = {
	label: string;
	href: string;
	external?: boolean;
};

type FooterSection = {
	title: string;
	links: FooterLink[];
};

const footerSections: FooterSection[] = [
	{
		title: "Product",
		links: [
			{ label: "Developer Console", href: "/console" },
			{
				label: "GitHub",
				href: "https://github.com/hetpatel-11/Auth-Agent2",
				external: true,
			},
			{
				label: "Roadmap",
				href: "https://github.com/hetpatel-11/Auth-Agent2/blob/main/docs/PRODUCTION_READINESS.md",
				external: true,
			},
		],
	},
	{
		title: "Documentation",
		links: [
			{
				label: "Introduction",
				href: "https://aiauth.mintlify.app/introduction",
				external: true,
			},
			{
				label: "Quickstart",
				href: "https://aiauth.mintlify.app/introduction",
				external: true,
			},
			{
				label: "Integration Guide",
				href: "https://aiauth.mintlify.app/introduction",
				external: true,
			},
			{
				label: "API Reference",
				href: "https://aiauth.mintlify.app/introduction",
				external: true,
			},
		],
	},
	{
		title: "Resources",
		links: [
			{
				label: "Documentation",
				href: "https://aiauth.mintlify.app/introduction",
				external: true,
			},
			{
				label: "Code Examples",
				href: "https://aiauth.mintlify.app/introduction",
				external: true,
			},
			{
				label: "GitHub Issues",
				href: "https://github.com/hetpatel-11/Auth-Agent2/issues",
				external: true,
			},
		],
	},
	{
		title: "Support",
		links: [
			{
				label: "Email Support",
				href: "mailto:support@auth-agent.com",
				external: true,
			},
			{
				label: "Discord Community",
				href: "https://discord.gg/auth-agent",
				external: true,
			},
			{
				label: "Twitter",
				href: "https://twitter.com/authagenthq",
				external: true,
			},
		],
	},
];

export default function Footer() {
	const pathname = usePathname();
	const { user } = useAuth();

	// Hide footer on console page when user is logged in
	if (pathname === "/console" && user) {
		return null;
	}

	return (
		<footer className="border-zinc-800 border-t px-4 py-12">
			<div className="mx-auto w-full max-w-[80rem]">
				<div className="mb-8 grid gap-8 md:grid-cols-4">
					{footerSections.map((section) => (
						<div key={section.title}>
							<h3 className="mb-4 font-semibold text-lg text-primary">
								{section.title}
							</h3>
							<ul className="space-y-2">
								{section.links.map((link) => (
									<li key={link.href}>
										{link.external ? (
											<a
												href={link.href}
												target="_blank"
												rel="noopener noreferrer"
												className="text-zinc-400 transition-colors duration-75 ease-linear hover:text-primary"
											>
												{link.label}
											</a>
										) : (
											<Link
												href={link.href as Route}
												className="text-zinc-400 transition-colors duration-75 ease-linear hover:text-primary"
											>
												{link.label}
											</Link>
										)}
									</li>
								))}
							</ul>
						</div>
					))}
				</div>

				<div className="border-zinc-800 border-t pt-8 text-center">
					<p className="text-zinc-400">
						© 2025 Auth-Agent. OAuth 2.1 + OIDC authentication for AI agents.
					</p>
				</div>
			</div>
		</footer>
	);
}
