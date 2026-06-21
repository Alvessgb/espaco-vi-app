import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "database" },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY!,
      from: "Espaço Vi <noreply@espacovi.com.br>",
    }),
  ],
  pages: { signIn: "/login" },
  callbacks: {
    session({ session, user }) {
      if (user?.id) session.user.id = user.id;
      // @ts-expect-error — role is on db User but not in default Session type
      if (user?.role) session.user.role = user.role;
      return session;
    },
  },
});
