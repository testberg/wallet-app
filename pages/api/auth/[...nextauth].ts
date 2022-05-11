import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// https://next-auth.js.org/configuration/options
export default NextAuth({
    // https://next-auth.js.org/configuration/providers/oauth
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET,
        }),
    ],
    theme: {
        colorScheme: 'auto',
        brandColor: '#2ccd9a',
        logo:
            'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg',
    },
    callbacks: {
        async jwt({ token }) {
            token.userRole = 'admin';
            return token;
        },
    },
});
