"use client";

import { Menu, X } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "./ui/button";

interface NavLink {
	label: string;
	href: string;
	external?: boolean;
}

const navLinks: NavLink[] = [
	{
		label: "Features",
		href: "/features",
	},
	{
		label: "How It Works",
		href: "/how-it-works",
	},
	{
		label: "Docs",
		href: "https://aiauth.mintlify.app/introduction",
		external: true,
	},
	{
		label: "GitHub",
		href: "/github",
	},
];

export default function Navbar() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const pathname = usePathname();
	const { user, signInWithGoogle } = useAuth();

	// Hide navbar on console page when user is logged in
	if (pathname === "/console" && user) {
		return null;
	}

	const handleAuthAction = () => {
		if (user) {
			window.location.href = "/console";
		} else {
			signInWithGoogle();
		}
	};

	return (
		<div className="z-20 flex w-full border-[#321808] border-b bg-black/20 backdrop-blur-md">
			<div className="mx-auto flex w-full max-w-[80rem] items-center justify-between border-zinc-800 border-b bg-transparent px-8 py-8 sm:px-6 md:py-6">
				<div className="flex items-center gap-2 sm:gap-4">
					<div className="flex items-center gap-2">
						<Image
							src={"/assets/logo.png"}
							alt="auth-agent"
							width={32}
							height={32}
							className="h-9 w-auto sm:h-6"
						/>
						<h3 className="font-semibold text-white text-xl sm:text-xl">
							auth-agent
						</h3>
					</div>

					<div className="hidden border border-zinc-200 p-2 text-center font-bold text-xs uppercase tracking-tight sm:block">
						calhacks edition
					</div>
				</div>

				<div className="hidden items-center gap-6 lg:flex lg:gap-8">
					{navLinks.map((link) =>
						link.external ? (
							<a
								key={link.href}
								href={link.href}
								target="_blank"
								rel="noopener noreferrer"
								className="text-md text-white transition-colors duration-75 ease-linear hover:text-zinc-200"
							>
								{link.label}
							</a>
						) : (
							<Link
								key={link.href}
								href={link.href as Route}
								className="text-md text-white transition-colors duration-75 ease-linear hover:text-zinc-200"
							>
								{link.label}
							</Link>
						),
					)}
				</div>

				<div className="hidden items-center gap-2 lg:flex">
					<Button
						variant={"ghost"}
						className="border-none bg-transparent font-normal text-md text-white hover:bg-transparent hover:text-zinc-200"
						onClick={handleAuthAction}
					>
						{user ? "Console" : "Sign In"}
					</Button>

					<Button className="uppercase" onClick={handleAuthAction}>
						{user ? "Go to Console" : "Get Started"}
					</Button>
				</div>

				<button
					type="button"
					className="lg:hidden"
					onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					aria-label="Toggle menu"
				>
					{mobileMenuOpen ? (
						<X className="size-8 text-white" />
					) : (
						<Menu className="size-8 text-white" />
					)}
				</button>
			</div>

			{mobileMenuOpen && (
				<div className="absolute top-full left-0 w-full border-zinc-800 border-b bg-black/95 backdrop-blur-md lg:hidden">
					<div className="flex flex-col gap-4 px-4 py-6">
						{navLinks.map((link) =>
							link.external ? (
								<a
									key={link.href}
									href={link.href}
									target="_blank"
									rel="noopener noreferrer"
									className="text-md text-white transition-colors duration-75 ease-linear hover:text-zinc-200"
									onClick={() => setMobileMenuOpen(false)}
								>
									{link.label}
								</a>
							) : (
								<Link
									key={link.href}
									href={link.href as Route}
									className="text-md text-white transition-colors duration-75 ease-linear hover:text-zinc-200"
									onClick={() => setMobileMenuOpen(false)}
								>
									{link.label}
								</Link>
							),
						)}
						<div className="mt-2 flex flex-col gap-2">
							<Button
								variant={"ghost"}
								className="border-none bg-transparent font-normal text-md text-white hover:bg-transparent hover:text-zinc-200"
								onClick={handleAuthAction}
							>
								{user ? "Console" : "Sign In"}
							</Button>
							<Button className="uppercase" onClick={handleAuthAction}>
								{user ? "Go to Console" : "Get Started"}
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
