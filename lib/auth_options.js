import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: 'verificationToken',
      name: 'Verification_Token',
      credentials: {
        email: { label: 'Email', type: 'email' },
        otp: { label: 'OTP', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otp) {
          throw new Error('Email and OTP are required');
        }

        try {
          await prisma.$connect();

          let user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          if (!user) {
            user = await prisma.user.create({
              data: {
                email: credentials.email,
                emailVerified: new Date(),
              },
            });
          }

          // Find the OTP record
          const otpRecord = await prisma.verificationToken.findFirst({
            where: {
              userId: user.id,
              token: credentials.otp,
              expires: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
          });
          if (!otpRecord) {
            throw new Error('Invalid or expired OTP');
          }

          // Delete the used OTP
          await prisma.verificationToken.deleteMany({
            where: { id: otpRecord.id },
          });
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error('OTP verification error:', error);
          throw new Error(error.message);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/signin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
