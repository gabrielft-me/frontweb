"use client";

import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "./ui/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<AuthProvider>
			{children}
			<Toaster richColors />
		</AuthProvider>
	);
}
