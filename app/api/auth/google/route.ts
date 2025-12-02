import { google } from "googleapis";
import { redirect } from "next/navigation";

const scopes = [
  {
    value: "https://www.googleapis.com/auth/userinfo.email",
  },
  {
    value: "https://www.googleapis.com/auth/userinfo.profile",
  },

  {
    value: "openid",
  },
];

export function GET() {
  let url;
  try {
    const authClient = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/api/auth/callback/google`
    );
    url = authClient.generateAuthUrl({
      access_type: "offline",
      scope: scopes.map((item) => item.value),
    });
  } catch (error) {
    console.log(error);
    url = "/";
  }
  redirect(url);
}
