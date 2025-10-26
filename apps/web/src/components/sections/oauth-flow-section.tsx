import { motion } from "motion/react";
import Container from "@/components/container";
import { FlowStep } from "@/components/ui/flow-step";
import { LightRays } from "@/components/ui/light-rays";
import { MagicCard } from "@/components/ui/magic-card";
import { SectionHeading } from "@/components/ui/section-heading";

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.15,
			delayChildren: 0.1,
		},
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.6,
			ease: [0, 0, 0.2, 1] as const,
		},
	},
};

const flowLineVariants = {
	hidden: { scaleX: 0, opacity: 0 },
	visible: {
		scaleX: 1,
		opacity: 1,
		transition: {
			duration: 0.8,
			ease: [0.42, 0, 0.58, 1] as const,
		},
	},
};

export function OAuthFlowSection() {
	return (
		<section className="relative z-10 py-16 sm:py-24 md:py-32">
			<LightRays
				className="opacity-30"
				count={5}
				color="rgba(255, 136, 0, 0.15)"
				blur={40}
				speed={16}
			/>
			<Container>
				<SectionHeading
					title="OAuth 2.1 Authorization Code Flow"
					className="mb-8 sm:mb-12"
				/>

				<motion.div
					className="mx-auto w-full rounded-lg border border-primary/20 bg-black/30 p-4 backdrop-blur-sm sm:max-w-5xl sm:p-6 md:p-8"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-100px" }}
					variants={containerVariants}
				>
					<motion.div className="grid grid-cols-1 items-center gap-8 sm:gap-8 md:grid-cols-3">
						<motion.div variants={itemVariants} whileHover={{ scale: 1.05 }}>
							<FlowStep
								title="AI Agent"
								subtitle="Python SDK"
								icon={
									<svg
										className="size-8 text-primary"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<title>AI Agent</title>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
										/>
									</svg>
								}
								steps={[
									"1. Generate PKCE",
									"3. Poll challenge",
									"5. Confirm auth",
								]}
							/>
						</motion.div>

						<motion.div variants={itemVariants} whileHover={{ scale: 1.05 }}>
							<FlowStep
								title="Auth-Agent"
								subtitle="OAuth 2.1 Server"
								icon={
									<svg
										className="size-8 text-primary"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<title>Auth-Agent Server</title>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
										/>
									</svg>
								}
								steps={[
									"2. Show verification",
									"4. Return challenge",
									"6. Issue tokens",
								]}
							/>
						</motion.div>

						<motion.div variants={itemVariants} whileHover={{ scale: 1.05 }}>
							<FlowStep
								title="Website"
								subtitle="OAuth Client"
								icon={
									<svg
										className="size-8 text-primary"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<title>Website</title>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
										/>
									</svg>
								}
								steps={[
									"7. Exchange code",
									"8. Get user info",
									"9. Create session",
								]}
							/>
						</motion.div>
					</motion.div>

					<motion.div
						className="mt-8 hidden space-y-4 sm:block"
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						variants={containerVariants}
					>
						<motion.div
							className="flex items-center justify-center space-x-4"
							variants={flowLineVariants}
							whileHover={{ scale: 1.02 }}
						>
							<motion.div
								className="h-px flex-1 bg-gradient-to-r from-transparent via-primary to-transparent"
								animate={{ opacity: [0.5, 1, 0.5] }}
								transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
							/>
							<div className="rounded-full bg-primary px-3 py-1 font-medium text-black text-sm shadow-lg shadow-primary/50">
								PKCE Challenge
							</div>
							<motion.div
								className="h-px flex-1 bg-gradient-to-r from-transparent via-primary to-transparent"
								animate={{ opacity: [0.5, 1, 0.5] }}
								transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
							/>
						</motion.div>
						<motion.div
							className="flex items-center justify-center space-x-4"
							variants={flowLineVariants}
							whileHover={{ scale: 1.02 }}
						>
							<motion.div
								className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent"
								animate={{ opacity: [0.5, 1, 0.5] }}
								transition={{
									duration: 2,
									repeat: Number.POSITIVE_INFINITY,
									delay: 0.3,
								}}
							/>
							<div className="rounded-full bg-orange-400 px-3 py-1 font-medium text-black text-sm shadow-lg shadow-orange-400/50">
								Authorization Code
							</div>
							<motion.div
								className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent"
								animate={{ opacity: [0.5, 1, 0.5] }}
								transition={{
									duration: 2,
									repeat: Number.POSITIVE_INFINITY,
									delay: 0.3,
								}}
							/>
						</motion.div>
						<motion.div
							className="flex items-center justify-center space-x-4"
							variants={flowLineVariants}
							whileHover={{ scale: 1.02 }}
						>
							<motion.div
								className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-600 to-transparent"
								animate={{ opacity: [0.5, 1, 0.5] }}
								transition={{
									duration: 2,
									repeat: Number.POSITIVE_INFINITY,
									delay: 0.6,
								}}
							/>
							<div className="rounded-full bg-orange-600 px-3 py-1 font-medium text-sm text-white shadow-lg shadow-orange-600/50">
								Access Token
							</div>
							<motion.div
								className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-600 to-transparent"
								animate={{ opacity: [0.5, 1, 0.5] }}
								transition={{
									duration: 2,
									repeat: Number.POSITIVE_INFINITY,
									delay: 0.6,
								}}
							/>
						</motion.div>
					</motion.div>

					<motion.div
						className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3"
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						variants={containerVariants}
					>
						<motion.div variants={itemVariants}>
							<MagicCard
								gradientSize={300}
								gradientColor="#1a1a1a"
								gradientOpacity={0.6}
								gradientFrom="#ff8800"
								gradientTo="#ffaa00"
								className="group cursor-pointer"
							>
								<div className="rounded-lg border border-primary/20 bg-black/50 p-4 text-center transition-all duration-300 group-hover:bg-black/60">
									<div className="mx-auto mb-2 flex size-8 items-center justify-center rounded-full bg-primary">
										<svg
											className="size-4 text-black"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<title>PKCE Protection</title>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
											/>
										</svg>
									</div>
									<h4 className="font-semibold text-sm text-white">
										PKCE Protection
									</h4>
									<p className="text-xs text-zinc-400">
										Prevents code interception
									</p>
								</div>
							</MagicCard>
						</motion.div>

						<motion.div variants={itemVariants}>
							<MagicCard
								gradientSize={300}
								gradientColor="#1a1a1a"
								gradientOpacity={0.6}
								gradientFrom="#ff8800"
								gradientTo="#ffaa00"
								className="group cursor-pointer"
							>
								<div className="rounded-lg border border-primary/20 bg-black/50 p-4 text-center transition-all duration-300 group-hover:bg-black/60">
									<div className="mx-auto mb-2 flex size-8 items-center justify-center rounded-full bg-primary">
										<svg
											className="size-4 text-black"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<title>State Validation</title>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
											/>
										</svg>
									</div>
									<h4 className="font-semibold text-sm text-white">
										State Validation
									</h4>
									<p className="text-xs text-zinc-400">CSRF protection</p>
								</div>
							</MagicCard>
						</motion.div>

						<motion.div variants={itemVariants}>
							<MagicCard
								gradientSize={300}
								gradientColor="#1a1a1a"
								gradientOpacity={0.6}
								gradientFrom="#ff8800"
								gradientTo="#ffaa00"
								className="group cursor-pointer"
							>
								<div className="rounded-lg border border-primary/20 bg-black/50 p-4 text-center transition-all duration-300 group-hover:bg-black/60">
									<div className="mx-auto mb-2 flex size-8 items-center justify-center rounded-full bg-primary">
										<svg
											className="size-4 text-black"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<title>JWT Tokens</title>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M13 10V3L4 14h7v7l9-11h-7z"
											/>
										</svg>
									</div>
									<h4 className="font-semibold text-sm text-white">
										JWT Tokens
									</h4>
									<p className="text-xs text-zinc-400">Secure & stateless</p>
								</div>
							</MagicCard>
						</motion.div>
					</motion.div>
				</motion.div>
			</Container>
		</section>
	);
}
