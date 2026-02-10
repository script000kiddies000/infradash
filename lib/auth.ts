import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import prisma from './db'

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'secret-tetap-untuk-dashboard-infra-999';

export const authOptions: NextAuthOptions = {
    secret: NEXTAUTH_SECRET,
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                username: { label: 'Username', type: 'text' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                console.log('--- AUTH ATTEMPT ---');
                if (!credentials?.username || !credentials?.password) {
                    console.log('Auth failed: Missing credentials');
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { username: credentials.username }
                });

                if (!user) {
                    console.log('Auth failed: User not found');
                    return null;
                }

                const isValid = await compare(credentials.password, user.password);
                if (!isValid) {
                    console.log('Auth failed: Invalid password');
                    return null;
                }

                console.log('Auth SUCCESS:', user.username);
                return {
                    id: user.id,
                    name: user.username,
                    email: user.username + '@local'
                };
            }
        })
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60,
    },
    pages: {
        signIn: '/login',
    },
    callbacks: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async jwt({ token, user }: { token: any; user?: any }) {
            if (user) {
                token.id = user.id;
                console.log('JWT created for:', user.name);
            }
            return token;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async session({ session, token }: { session: any; token: any }) {
            if (session?.user) {
                session.user.id = token.id;
                console.log('Session active for ID:', token.id);
            }
            return session;
        }
    },
    debug: true,
}
