export function clerkEnabled() {
  return process.env.NEXT_PUBLIC_AUTH_PROVIDER === "clerk";
}

type Identity = { emailAddresses: Array<{ emailAddress: string; verification: { status: string } | null }> };
// Authorization is server-configured; signing up never grants store management access.
export function allowedClerkAdmin(user: Identity | null, allowlist: string) {
  const emails = new Set(allowlist.split(",").map(email => email.trim().toLowerCase()).filter(Boolean));
  return Boolean(user?.emailAddresses.some(email => email.verification?.status === "verified" && emails.has(email.emailAddress.toLowerCase())));
}
