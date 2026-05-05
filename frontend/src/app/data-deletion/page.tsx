import Link from "next/link";

export const metadata = {
  title: "Data Deletion Instructions — MarketAI",
  description:
    "How to delete the data MarketAI stores about your connected social accounts.",
};

export default function DataDeletionPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-black tracking-tight mb-2">
          Data Deletion Instructions
        </h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: 2026-05-05</p>

        <section className="space-y-6 text-base leading-relaxed">
          <p>
            MarketAI lets you connect Threads and Facebook accounts to schedule
            and publish content. This page explains exactly how to remove every
            piece of data we hold about you.
          </p>

          <h2 className="text-xl font-bold mt-10 mb-3">
            1. Disconnect a single platform (instant)
          </h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              Log in at{" "}
              <Link href="/dashboard/social" className="text-[#E8734A] underline">
                /dashboard/social
              </Link>
              .
            </li>
            <li>
              Click <b>"Ngắt kết nối"</b> next to the platform you want to remove.
            </li>
            <li>
              Our backend immediately deletes the encrypted OAuth token row from
              our database (
              <code>DELETE /api/social/:platform</code>). Nothing is retained.
            </li>
          </ol>

          <h2 className="text-xl font-bold mt-10 mb-3">
            2. Delete your entire MarketAI account
          </h2>
          <p>
            Email <b>21052005h@gmail.com</b> from the email address you registered
            with, subject line <b>"Delete my account"</b>. We will:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Confirm your identity by replying to that email.</li>
            <li>
              Erase your user record, all generated content, all schedules, all
              social tokens, and all analytics rows tied to your account within
              30 days.
            </li>
            <li>Send a final confirmation email when erasure is complete.</li>
          </ul>

          <h2 className="text-xl font-bold mt-10 mb-3">
            3. Revoke access from Threads / Facebook directly
          </h2>
          <p>
            You can also revoke MarketAI from outside our app:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <b>Threads:</b> Settings → Account → Apps and Websites → Remove
              "Ai-Agent-Marketing-Threads".
            </li>
            <li>
              <b>Facebook:</b> Settings & Privacy → Settings → Apps and Websites
              → Remove the MarketAI entry.
            </li>
          </ul>
          <p>
            Once revoked, our next API call returns an invalid-token error and
            we purge the stored token on the next sync cycle (max 24 hours).
          </p>

          <h2 className="text-xl font-bold mt-10 mb-3">4. What we never store</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Your Threads/Facebook password.</li>
            <li>Follower lists, private messages, or other users' content.</li>
            <li>
              Plain-text OAuth tokens — all tokens are encrypted with AES-256-GCM
              before being persisted.
            </li>
          </ul>

          <h2 className="text-xl font-bold mt-10 mb-3">5. Contact</h2>
          <p>
            Questions about this process? Email{" "}
            <a
              href="mailto:21052005h@gmail.com"
              className="text-[#E8734A] underline"
            >
              21052005h@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
