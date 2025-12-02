import { redirect } from "next/navigation";

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/api/auth/callback/google`;

  const params = new URLSearchParams({
    client_id: clientId!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });

  redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
