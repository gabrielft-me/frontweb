"use client";

import { CheckCircle2, Shield } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

interface ConsentModalProps {
	isOpen: boolean;
	onAccept: () => void;
	onDecline: () => void;
}

export function ConsentModal({
	isOpen,
	onAccept,
	onDecline,
}: ConsentModalProps) {
	const [hasScrolled, setHasScrolled] = useState(false);
	const [agreedToTerms, setAgreedToTerms] = useState(false);

	if (!isOpen) return null;

	const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
		const element = e.currentTarget;
		const scrolledToBottom =
			element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
		if (scrolledToBottom) {
			setHasScrolled(true);
		}
	};

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
			<div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 shadow-2xl">
				{/* Header */}
				<div className="border-zinc-800 border-b bg-zinc-900/50 p-6">
					<div className="flex items-start gap-4">
						<div className="rounded-full bg-primary/10 p-3">
							<Shield className="h-6 w-6 text-primary" />
						</div>
						<div className="flex-1">
							<h2 className="font-bold text-2xl text-white">
								Terms of Consent
							</h2>
							<p className="mt-1 text-sm text-zinc-400">
								Please review and accept our terms to continue
							</p>
						</div>
					</div>
				</div>

				{/* Content */}
				<div
					className="max-h-[50vh] overflow-y-auto p-6"
					onScroll={handleScroll}
				>
					<div className="space-y-6 text-zinc-300">
						<section>
							<h3 className="mb-3 font-semibold text-lg text-white">
								Agent Authorization
							</h3>
							<p className="mb-2 text-sm leading-relaxed">
								By accepting these terms, you authorize Auth-Agent and its AI
								agents to act on your behalf for the following purposes:
							</p>
							<ul className="ml-6 space-y-2 text-sm">
								<li className="list-disc">
									Access and manage your authentication credentials
								</li>
								<li className="list-disc">
									Perform OAuth 2.1 authorization flows with third-party
									services
								</li>
								<li className="list-disc">
									Store and retrieve your encrypted access tokens
								</li>
								<li className="list-disc">
									Execute API requests to authorized services on your behalf
								</li>
								<li className="list-disc">
									Manage session data and refresh tokens as needed
								</li>
							</ul>
						</section>

						<section>
							<h3 className="mb-3 font-semibold text-lg text-white">
								Data Usage & Privacy
							</h3>
							<p className="mb-2 text-sm leading-relaxed">
								We take your privacy seriously. Here's how we handle your data:
							</p>
							<ul className="ml-6 space-y-2 text-sm">
								<li className="list-disc">
									All credentials are encrypted using industry-standard
									encryption (AES-256)
								</li>
								<li className="list-disc">
									We never share your personal data with third parties without
									your explicit consent
								</li>
								<li className="list-disc">
									Access tokens are stored securely and only accessible by
									authorized agents
								</li>
								<li className="list-disc">
									You can revoke agent access at any time from your console
								</li>
								<li className="list-disc">
									We log all agent actions for audit and security purposes
								</li>
							</ul>
						</section>

						<section>
							<h3 className="mb-3 font-semibold text-lg text-white">
								Your Rights
							</h3>
							<ul className="ml-6 space-y-2 text-sm">
								<li className="list-disc">
									Right to revoke authorization at any time
								</li>
								<li className="list-disc">
									Right to delete your data and account
								</li>
								<li className="list-disc">Right to export your data</li>
								<li className="list-disc">
									Right to audit agent actions and access logs
								</li>
								<li className="list-disc">
									Right to limit agent permissions and scopes
								</li>
							</ul>
						</section>

						<section>
							<h3 className="mb-3 font-semibold text-lg text-white">
								Security & Compliance
							</h3>
							<p className="text-sm leading-relaxed">
								Auth-Agent is compliant with OAuth 2.1, OIDC standards, and
								follows security best practices. We implement:
							</p>
							<ul className="mt-2 ml-6 space-y-2 text-sm">
								<li className="list-disc">End-to-end encryption</li>
								<li className="list-disc">
									PKCE (Proof Key for Code Exchange)
								</li>
								<li className="list-disc">Token rotation and expiration</li>
								<li className="list-disc">
									Rate limiting and abuse prevention
								</li>
								<li className="list-disc">Regular security audits</li>
							</ul>
						</section>

						<section>
							<h3 className="mb-3 font-semibold text-lg text-white">
								Liability & Disclaimer
							</h3>
							<p className="text-sm leading-relaxed">
								While we strive for accuracy and reliability, Auth-Agent is
								provided "as is" without warranties. You are responsible for
								reviewing and approving all agent actions. We recommend
								regularly monitoring your console for unauthorized activity.
							</p>
						</section>

						{!hasScrolled && (
							<div className="mt-4 rounded-lg border border-yellow-700 bg-yellow-900/20 p-4">
								<p className="text-sm text-yellow-400">
									📜 Please scroll down to read all terms before accepting
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Checkbox */}
				<div className="border-zinc-800 border-t bg-zinc-900/50 px-6 py-4">
					<label className="flex cursor-pointer items-start gap-3">
						<input
							type="checkbox"
							checked={agreedToTerms}
							onChange={(e) => setAgreedToTerms(e.target.checked)}
							disabled={!hasScrolled}
							className="mt-1 h-5 w-5 cursor-pointer rounded border-zinc-700 bg-zinc-800 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
						/>
						<span className="text-sm text-zinc-300">
							I have read and agree to the Terms of Consent, and I authorize
							Auth-Agent and its AI agents to act on my behalf as described
							above.
						</span>
					</label>
				</div>

				{/* Footer */}
				<div className="flex justify-end gap-3 border-zinc-800 border-t bg-zinc-900/50 p-6">
					<Button onClick={onDecline} variant="outline" size="lg">
						Decline
					</Button>
					<Button
						onClick={onAccept}
						disabled={!agreedToTerms || !hasScrolled}
						className="gap-2 bg-primary hover:bg-primary/90"
						size="lg"
					>
						<CheckCircle2 className="h-4 w-4" />
						Accept & Continue
					</Button>
				</div>
			</div>
		</div>
	);
}
