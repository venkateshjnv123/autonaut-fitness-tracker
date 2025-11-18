// lib/authOptions.ts
import EmailProvider from "next-auth/providers/email";
import { NextAuthOptions } from "next-auth";
import nodemailer from "nodemailer";
import { getAdmins } from "./admins";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const authOptions: NextAuthOptions = {
  providers: [
    EmailProvider({
      maxAge: 10 * 60, // magic link / token expiry: 10 minutes
      // NextAuth will call `sendVerificationRequest` with token + url
      async sendVerificationRequest({ identifier, url, provider }) {
        const { host } = new URL(url);
        const html = `
          <p>Sign in to <strong>Fitness Leaderboard</strong></p>
          <p>Click the link below to sign in (expires in 10 minutes):</p>
          <p><a href="${url}">${url}</a></p>
          <p>If you didn't request this, ignore this email.</p>
        `;
        await transporter.sendMail({
          to: identifier,
          from: provider.from!,
          subject: `Your sign-in link for ${host}`,
          html,
        });
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      // when user first signs in, `user` is populated; we can attach role later in session callback
      return token;
    },
    async session({ session, token, user }) {
      // session.user.email exists; determine admin membership server-side
      const email = session.user?.email?.toLowerCase() || "";
      const admins = await getAdmins(); // reads server-side JSON
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (session.user as any).role = admins.includes(email) ? "admin" : "user";
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
