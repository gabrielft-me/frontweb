"use client";

import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { ConsentModal } from "@/components/consent-modal";
import { createClient } from "@/lib/supabase/client";

interface AuthContextType {
	user: User | null;
	loading: boolean;
	signInWithGoogle: () => Promise<void>;
	signOut: () => Promise<void>;
	hasConsent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [showConsentModal, setShowConsentModal] = useState(false);
	const [hasConsent, setHasConsent] = useState(false);
	const router = useRouter();
	const supabase = createClient();

	useEffect(() => {
		// Get initial session
		supabase.auth.getSession().then(({ data: { session } }) => {
			setUser(session?.user ?? null);
			setLoading(false);

			// Check if user has given consent
			if (session?.user) {
				const consent = localStorage.getItem(`consent_${session.user.id}`);
				if (consent === "accepted") {
					setHasConsent(true);
				} else {
					// Show consent modal for new users
					setShowConsentModal(true);
				}
			}
		});

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null);
			setLoading(false);

			// Check consent for new session
			if (session?.user) {
				const consent = localStorage.getItem(`consent_${session.user.id}`);
				if (consent === "accepted") {
					setHasConsent(true);
				} else {
					setShowConsentModal(true);
				}
			} else {
				setHasConsent(false);
				setShowConsentModal(false);
			}
		});

		return () => subscription.unsubscribe();
	}, [supabase.auth]);

	const signInWithGoogle = useCallback(async () => {
		// Use production URL if available, otherwise fall back to current origin
		const redirectUrl =
			process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

		const { error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: `${redirectUrl}/auth/callback`,
			},
		});

		if (error) {
			console.error("Error signing in with Google:", error.message);
		}
	}, [supabase.auth]);

	const signOut = useCallback(async () => {
		await supabase.auth.signOut();
		setHasConsent(false);
		setShowConsentModal(false);
		router.push("/");
	}, [router, supabase.auth]);

	const handleAcceptConsent = useCallback(() => {
		if (user) {
			localStorage.setItem(`consent_${user.id}`, "accepted");
			setHasConsent(true);
			setShowConsentModal(false);
		}
	}, [user]);

	const handleDeclineConsent = useCallback(async () => {
		// Sign out user if they decline consent
		await supabase.auth.signOut();
		setShowConsentModal(false);
		setHasConsent(false);
		router.push("/");
	}, [router, supabase.auth]);

	const value = {
		user,
		loading,
		signInWithGoogle,
		signOut,
		hasConsent,
	};

	return (
		<AuthContext.Provider value={value}>
			{children}
			<ConsentModal
				isOpen={showConsentModal}
				onAccept={handleAcceptConsent}
				onDecline={handleDeclineConsent}
			/>
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
