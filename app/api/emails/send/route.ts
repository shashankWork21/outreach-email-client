import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token");

  if (!sessionToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  const formData = await request.formData();
  const emailsRaw = formData.get("emails") as string;
  const subject = formData.get("subject") as string;
  const body = formData.get("body") as string;

  if (!emailsRaw || !subject || !body) {
    return new Response("Missing fields", { status: 400 });
  }

  const emailList = emailsRaw
    .split(",")
    .map((e) => e.trim())
    .filter((e) => e);

  // Create contacts if they don't exist
  const contacts = await Promise.all(
    emailList.map(async (email) => {
      return await prisma.contact.upsert({
        where: { email },
        update: {},
        create: { email },
      });
    })
  );

  // Create email and link contacts
  await prisma.email.create({
    data: {
      subject,
      body,
      contacts: {
        connect: contacts.map((c) => ({ id: c.id })),
      },
    },
  });

  // Send emails via SES
  await Promise.all(
    emailList.map(async (toEmail) => {
      const command = new SendEmailCommand({
        Source: `Smart Algorhythm <${process.env.SES_DEFAULT_FROM_EMAIL}>`,
        ReplyToAddresses: ["shashank@smartalgorhythm.com"],
        Destination: {
          ToAddresses: [toEmail],
          CcAddresses: ["adv.yojha@gmail.com"],
        },
        Message: {
          Subject: {
            Data: subject,
          },
          Body: {
            Text: {
              Data: body,
            },
          },
        },
      });

      try {
        await sesClient.send(command);
      } catch (error) {
        console.error(`Failed to send email to ${toEmail}:`, error);
      }
    })
  );

  redirect("/emails");
}
