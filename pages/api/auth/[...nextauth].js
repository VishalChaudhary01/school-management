import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth_options';

export default NextAuth(authOptions);
