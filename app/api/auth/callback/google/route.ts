import prisma from "@/lib/prisma";
import { google } from "googleapis";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";

const ALLOWED_EMAILS = ["adv.yojha@gmail.com", "shashank@smartalgorhythm.com"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    redirect("/");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/api/auth/callback/google`;

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  let allowed = false;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const { data: userInfo } = await oauth2.userinfo.get();

    if (!userInfo.email || !ALLOWED_EMAILS.includes(userInfo.email)) {
      // Email not allowed
      redirect("/");
    }

    console.log(userInfo);
    let user = await prisma.user.findUnique({
      where: { email: userInfo.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: userInfo.email!,
          name: `${userInfo.given_name || ""} ${
            userInfo.family_name || ""
          }`.trim(),
          role: "user",
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        },
      });
    }

    // Create session token (JWT)
    const sessionToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.AWS_SECRET_ACCESS_KEY || "secret", // Using AWS secret as JWT secret for now, or add JWT_SECRET to env
      { expiresIn: "7d" }
    );

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    allowed = true;
  } catch (error) {
    console.error("Auth error:", error);
  }

  if (allowed) {
    redirect("/emails");
  } else {
    redirect("/");
  }
}
