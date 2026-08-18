import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Google sign-in activates once AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET are set
// (see .env.example). Until then the app runs in guest mode.
export const googleConfigured = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? "pocketravel-demo-secret-change-me",
  trustHost: true,
  providers: googleConfigured ? [Google] : [],
});
