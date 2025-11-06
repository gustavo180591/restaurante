import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is not set in production environment');
}

const SECRET_KEY = new TextEncoder().encode(JWT_SECRET || 'dev-secret-change-me');
const ISSUER = 'restaurante-auth';
const AUDIENCE = 'restaurante-web';

type SessionPayload = {
    sub: string;
    sv: number;
    roles: string[];
};

export async function signSession(payload: SessionPayload, expiresIn = '7d'): Promise<string> {
    return await new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setIssuer(ISSUER)
        .setAudience(AUDIENCE)
        .setExpirationTime(expiresIn)
        .sign(SECRET_KEY);
}

export async function verifySession(token: string): Promise<JWTPayload & SessionPayload> {
    try {
        console.log('Verifying JWT token...');
        const { payload } = await jwtVerify(token, SECRET_KEY, {
            issuer: ISSUER,
            audience: AUDIENCE,
        });

        // Validar que el payload tenga la estructura esperada
        if (!payload || typeof payload !== 'object') {
            console.error('Invalid token payload:', payload);
            throw new Error('Invalid token format');
        }

        // Verificar campos requeridos
        const requiredFields = ['sub', 'sv', 'roles'];
        for (const field of requiredFields) {
            if (!(field in payload)) {
                console.error(`Missing required field in token: ${field}`);
                throw new Error(`Missing required field: ${field}`);
            }
        }

        // Asegurar que los tipos sean correctos
        const typedPayload = payload as JWTPayload & SessionPayload;
        if (typeof typedPayload.sub !== 'string' || 
            typeof typedPayload.sv !== 'number' || 
            !Array.isArray(typedPayload.roles)) {
            console.error('Invalid token payload types:', {
                sub: typeof typedPayload.sub,
                sv: typeof typedPayload.sv,
                roles: Array.isArray(typedPayload.roles) ? 'array' : typeof typedPayload.roles
            });
            throw new Error('Invalid token payload structure');
        }

        console.log('Token verified successfully for user:', typedPayload.sub);
        return typedPayload;
    } catch (error) {
        console.error('Token verification failed:', error instanceof Error ? error.message : 'Unknown error');
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Invalid or expired token');
    }
}
