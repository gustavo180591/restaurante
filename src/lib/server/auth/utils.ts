import { type Cookies } from '@sveltejs/kit';
import { signSession } from '../jwt';

const COOKIE_NAME = 'session';
const SESSION_DURATION_DAYS = 7;

export async function createSessionCookie(userId: string, sessionVersion: number, roles: string[]) {
    const token = await signSession({
        sub: userId,
        sv: sessionVersion,
        roles,
    }, `${SESSION_DURATION_DAYS}d`);

    return {
        name: COOKIE_NAME,
        value: token,
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60, // 7 days in seconds
    };
}

export function deleteSessionCookie() {
    return {
        name: COOKIE_NAME,
        value: '',
        path: '/',
        expires: new Date(0), // Set to past date to delete
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
    };
}

export function getTokenFromCookies(cookies: Cookies): string | null {
    return cookies.get(COOKIE_NAME) ?? null;
}

// Helper to get user data without sensitive information
export function sanitizeUser(user: any) {
    if (!user) return null;
    
    const { password, sessionVersion, ...safeUser } = user;
    return safeUser;
}
