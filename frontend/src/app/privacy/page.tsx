import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — MarketAI",
  description:
    "Privacy Policy for MarketAI — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-black tracking-tight mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: 2026-05-10</p>

        <section className="space-y-6 text-base leading-relaxed">
          <p>
            MarketAI ("we", "our", "us") operates at{" "}
            <a
              href="https://aiagentmarketing-mauve.vercel.app"
              className="text-[#E8734A] underline"
            >
              aiagentmarketing-mauve.vercel.app
            </a>
            . This Privacy Policy explains what data we collect, why we collect
            it, and how you can control it.
          </p>

          <h2 className="text-xl font-bold mt-10 mb-3">1. Data We Collect</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <b>Account information:</b> Name, email address, and hashed
              password when you register.
            </li>
            <li>
              <b>Social account tokens:</b> OAuth access tokens for Facebook,
              Instagram, and Threads when you connect a platform. Tokens are
              stored encrypted with AES-256-GCM and never stored in plain text.
            </li>
            <li>
              <b>Content you create:</b> Posts, schedules, and generated
              marketing content saved in your account.
            </li>
            <li>
              <b>Usage data:</b> Basic server logs (IP address, request
              timestamps) for security and debugging purposes only.
            </li>
          </ul>

          <h2 className="text-xl font-bold mt-10 mb-3">2. How We Use Your Data</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To authenticate you and maintain your session.</li>
            <li>
              To publish content to social platforms on your behalf using the
              OAuth tokens you provide.
            </li>
            <li>To send password reset emails to your registered address.</li>
            <li>
              To improve the service and troubleshoot errors using anonymised
              logs.
            </li>
          </ul>
          <p>We do not sell, rent, or share your data with third parties for marketing purposes.</p>

          <h2 className="text-xl font-bold mt-10 mb-3">3. Facebook and Meta Platform Data</h2>
          <p>
            When you connect a Facebook or Instagram account, we request only the
            permissions required to manage your Pages and publish content:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><code>public_profile</code> — your name and profile picture</li>
            <li><code>email</code> — your Facebook email</li>
            <li><code>pages_show_list</code> — list of Pages you manage</li>
            <li><code>pages_read_engagement</code> — read Page insights</li>
            <li><code>pages_manage_posts</code> — publish posts to your Page</li>
            <li><code>pages_manage_metadata</code> — manage Page settings</li>
          </ul>
          <p>
            We do not access your friends list, private messages, or any data
            beyond what is listed above. You can revoke access at any time from
            Facebook Settings → Apps and Websites.
          </p>

          <h2 className="text-xl font-bold mt-10 mb-3">4. Data Retention</h2>
          <p>
            We retain your data for as long as your account is active. You may
            request deletion at any time — see our{" "}
            <Link href="/data-deletion" className="text-[#E8734A] underline">
              Data Deletion Instructions
            </Link>
            .
          </p>

          <h2 className="text-xl font-bold mt-10 mb-3">5. Security</h2>
          <p>
            All OAuth tokens are encrypted with AES-256-GCM before being stored
            in our database. Passwords are hashed using bcrypt with a cost factor
            of 12. All data is transmitted over HTTPS.
          </p>

          <h2 className="text-xl font-bold mt-10 mb-3">6. Your Rights</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access and export the data we hold about you.</li>
            <li>Correct inaccurate data via your profile settings.</li>
            <li>Delete your account and all associated data.</li>
            <li>Disconnect any social platform at any time.</li>
          </ul>

          <h2 className="text-xl font-bold mt-10 mb-3">7. Cookies</h2>
          <p>
            We use a single authentication cookie (JWT) to keep you logged in.
            We do not use advertising or tracking cookies.
          </p>

          <h2 className="text-xl font-bold mt-10 mb-3">8. Contact</h2>
          <p>
            For any privacy-related questions or data deletion requests, email{" "}
            <a
              href="mailto:imanutttt@gmail.com"
              className="text-[#E8734A] underline"
            >
              imanutttt@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
