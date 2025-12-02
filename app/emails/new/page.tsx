import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function NewEmailPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token");

  if (!sessionToken) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <Link
            href="/emails"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer"
          >
            &larr; Back to Dashboard
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">New Email</h1>
        </div>

        <form
          action="/api/emails/send"
          method="POST"
          className="space-y-6 rounded-xl bg-white p-8 shadow-sm"
        >
          <div>
            <label
              htmlFor="emails"
              className="block text-sm font-medium text-gray-700"
            >
              Email Addresses (comma separated)
            </label>
            <textarea
              name="emails"
              id="emails"
              rows={3}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              placeholder="john@example.com, jane@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-gray-700"
            >
              Subject
            </label>
            <input
              type="text"
              name="subject"
              id="subject"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="body"
              className="block text-sm font-medium text-gray-700"
            >
              Body
            </label>
            <textarea
              name="body"
              id="body"
              rows={6}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
            >
              Send Email
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
