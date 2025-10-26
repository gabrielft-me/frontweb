"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Container from "@/components/container";
import { CodeBlock } from "@/components/ui/code-block";
import { SectionHeading } from "@/components/ui/section-heading";
import { useMediaQuery } from "@/hooks/use-media-query";

export function ForWebsitesSection() {
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

				containerRef.current.style.minHeight = `${Math.max(
					codeHeight,
					textHeight,
				)}px`;
			} else if (containerRef.current) {
				containerRef.current.style.minHeight = "auto";
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
					title="For Websites"
					subtitle='Add "Login with AI Agent" using standard OAuth 2.1'
					subtitleClassName="text-zinc-300"
				/>

				<div
					ref={containerRef}
					className="grid items-start gap-8 md:grid-cols-2 md:gap-12"
				>
					<div ref={codeRef} className="md:sticky md:top-24">
						<CodeBlock
							language="javascript"
							code={`// PKCE Generation
async function generatePKCE() {
  const verifier = base64UrlEncode(
    crypto.getRandomValues(new Uint8Array(32))
  );
  const challenge = base64UrlEncode(
    await crypto.subtle.digest('SHA-256',
      new TextEncoder().encode(verifier))
  );
  return { verifier, challenge };
}

// Start OAuth Flow
async function startOAuth() {
  const { verifier, challenge } = await generatePKCE();
  const state = crypto.randomUUID();

  sessionStorage.setItem('oauth_state', state);
  sessionStorage.setItem('code_verifier', verifier);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: 'YOUR_CLIENT_ID',
    redirect_uri: window.location.origin + '/callback',
    scope: 'openid profile email agent',
    state: state,
    code_challenge: challenge,
    code_challenge_method: 'S256'
  });

  window.location.href =
    \`https://auth-agent.com/authorize?\${params}\`;
}`}
						/>
					</div>

					<motion.div
						ref={textRef}
						style={isDesktop ? { y: textY } : {}}
						className="px-6 sm:px-0"
					>
						<h3 className="mb-4 font-semibold text-primary text-xl sm:text-2xl">
							Standard OAuth 2.1 Integration
						</h3>
						<p className="mb-6 text-sm text-zinc-300 sm:text-base">
							If you've integrated Google Sign-In or GitHub OAuth, you already
							know how to use Auth-Agent. It's the exact same Authorization Code
							Flow with PKCE that you're familiar with—no proprietary protocols
							or custom implementations.
						</p>
						<ul className="space-y-2 text-sm text-zinc-300 sm:text-base">
							<li className="flex items-center">
								<span className="mr-3 size-2 shrink-0 rounded-full bg-primary" />
								Standard OAuth 2.1 endpoints
							</li>
							<li className="flex items-center">
								<span className="mr-3 size-2 shrink-0 rounded-full bg-primary" />
								OIDC discovery document
							</li>
							<li className="flex items-center">
								<span className="mr-3 size-2 shrink-0 rounded-full bg-primary" />
								JWT ID tokens with agent claims
							</li>
							<li className="flex items-center">
								<span className="mr-3 size-2 shrink-0 rounded-full bg-primary" />
								Token introspection endpoint
							</li>
						</ul>
					</motion.div>
				</div>
			</Container>
		</section>
	);
}
