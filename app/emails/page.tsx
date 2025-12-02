import prisma from "@/lib/prisma";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function EmailsPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token");

  if (!sessionToken) {
    redirect("/");
  }

  const emailCount = await prisma.email.count();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex gap-4">
            <Link
              href="/emails/new"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 cursor-pointer"
            >
              New Email
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Logout
              </button>
            </form>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Emails Sent</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {emailCount}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
