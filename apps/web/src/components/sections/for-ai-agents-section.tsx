"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Container from "@/components/container";
import { CodeBlock } from "@/components/ui/code-block";
import { SectionHeading } from "@/components/ui/section-heading";
import { useMediaQuery } from "@/hooks/use-media-query";

export function ForAIAgentsSection() {
	const sectionRef = useRef<HTMLElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const codeRef = useRef<HTMLDivElement>(null);
	const textRef = useRef<HTMLDivElement>(null);
	const [scrollRange, setScrollRange] = useState([0, 0]);
	const isDesktop = useMediaQuery("(min-width: 768px)");

	const { scrollYProgress } = useScroll({
		target: sectionRef,
		offset: ["start start", "end end"],
	});

	useEffect(() => {
		const updateScrollRange = () => {
			if (
				isDesktop &&
				codeRef.current &&
				textRef.current &&
				containerRef.current
			) {
				const codeHeight = codeRef.current.offsetHeight;
				const textHeight = textRef.current.offsetHeight;
				const maxScroll = Math.max(0, codeHeight - textHeight);
				setScrollRange([0, maxScroll]);

				containerRef.current.style.paddingBottom = `${maxScroll}px`;
			} else if (containerRef.current) {
				containerRef.current.style.paddingBottom = "0px";
			}
		};

		updateScrollRange();
		window.addEventListener("resize", updateScrollRange);
		return () => window.removeEventListener("resize", updateScrollRange);
	}, [isDesktop]);

	const textY = useTransform(
		scrollYProgress,
		[0, 1],
		scrollRange as [number, number],
	);

	return (
		<section
			ref={sectionRef}
			className="relative z-10 py-12 sm:py-16 md:min-h-screen md:py-20"
		>
			<Container>
				<SectionHeading
					title="For AI Agents"
					subtitle="Authenticate with any website using our Python SDK"
					subtitleClassName="text-zinc-300"
				/>

				<div
					ref={containerRef}
					className="grid items-start gap-8 md:grid-cols-2 md:gap-12"
				>
					<motion.div
						ref={textRef}
						style={isDesktop ? { y: textY } : {}}
						className="order-2 px-6 sm:px-0 md:order-1"
					>
						<h3 className="mb-4 font-semibold text-primary text-xl sm:text-2xl">
							OAuth 2.1 + PKCE
						</h3>
						<p className="mb-6 text-sm text-zinc-300 sm:text-base">
							Our Python SDK implements the complete OAuth 2.1 Authorization
							Code Flow with PKCE (Proof Key for Code Exchange). It
							automatically handles PKCE generation, state validation, token
							exchange, and token refresh—everything you need for secure
							authentication.
						</p>
						<ul className="space-y-2 text-sm text-zinc-300 sm:text-base">
							<li className="flex items-center">
								<span className="mr-3 size-2 flex-shrink-0 rounded-full bg-primary" />
								Automatic PKCE generation (SHA-256)
							</li>
							<li className="flex items-center">
								<span className="mr-3 size-2 flex-shrink-0 rounded-full bg-primary" />
								Token refresh with rotation
							</li>
							<li className="flex items-center">
								<span className="mr-3 size-2 flex-shrink-0 rounded-full bg-primary" />
								OIDC UserInfo endpoint support
							</li>
							<li className="flex items-center">
								<span className="mr-3 size-2 flex-shrink-0 rounded-full bg-primary" />
								Challenge-based polling flow
							</li>
						</ul>
					</motion.div>

					<div
						ref={codeRef}
						className="order-1 px-2 sm:px-0 md:sticky md:top-24 md:order-2"
					>
						<CodeBlock
							language="python"
							code={`from auth_agent import AgentSDK

# Initialize SDK
sdk = AgentSDK(agent_id="your_agent_id")

# Start OAuth flow (generates PKCE automatically)
auth_url = sdk.get_authorization_url(
    redirect_uri="https://yourapp.com/callback",
    scope="openid profile email agent"
)

print("Open:", auth_url)

# After user approves, exchange code
tokens = sdk.exchange_code(code, state, redirect_uri)

# Make authenticated requests
user_info = sdk.get_user_info()
print(f"Logged in as: {user_info['agent_name']}")

# SDK auto-refreshes expired tokens`}
						/>
					</div>
				</div>
			</Container>
		</section>
	);
}
