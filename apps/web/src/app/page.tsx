"use client";

import { CTASection } from "@/components/sections/cta-section";
import { ForAIAgentsSection } from "@/components/sections/for-ai-agents-section";
import { ForWebsitesSection } from "@/components/sections/for-websites-section";
import { HeroSection } from "@/components/sections/hero-section";
import { OAuthFlowSection } from "@/components/sections/oauth-flow-section";
import { WhatIsSection } from "@/components/sections/what-is-section";
import { WhyOAuthSection } from "@/components/sections/why-oauth-section";

export default function Page() {
	return (
		<div className="relative w-full">
			<HeroSection />

			<div className="flex flex-col gap-8 sm:gap-12 md:gap-16">
				<WhatIsSection />
				<ForAIAgentsSection />
				<ForWebsitesSection />
				<OAuthFlowSection />
				<WhyOAuthSection />
				<CTASection />
			</div>
		</div>
	);
}
