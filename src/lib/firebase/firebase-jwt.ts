import {
    decodeProtectedHeader,
    errors,
    importPKCS8,
    importX509,
    jwtVerify,
    SignJWT
} from "jose";
import {
    JWSSignatureVerificationFailed,
    JWTClaimValidationFailed,
    JWTExpired,
    JWTInvalid
} from "jose/errors";
import type { FirebaseIdTokenPayload, ServiceAccount } from "./firebase-types";
import { getJWKs, getPublicKeys } from "./firebase-auth-endpoints";

export async function verifySessionJWT(
    sessionCookie: string,
    projectId: string,
    fetchFn?: typeof globalThis.fetch
) {

    try {

        const { data, error } = await getPublicKeys(fetchFn);

        if (error) {
            return {
                data: null,
                error
            };
        }

        if (!data) {
            return {
                data: null,
                error: {
                    code: 500,
                    message: 'No public keys returned',
                    errors: []
                }
            };
        }

        const header = decodeProtectedHeader(sessionCookie);

        if (!header.kid || !data[header.kid]) {
            return {
                error: {
                    code: 500,
                    message: 'No KID found in token',
                    errors: []
                },
                data: null
            };
        }

        const certificate = data[header.kid];

        const publicKey = await importX509(certificate, 'RS256');

        const { payload } = await jwtVerify(sessionCookie, publicKey, {
            issuer: `https://session.firebase.google.com/${projectId}`,
            audience: projectId,
            algorithms: ['RS256']
        });

        return {
            error: null,
            data: payload as FirebaseIdTokenPayload
        };

    } catch (err: unknown) {

        if (err instanceof JWTExpired ||
            err instanceof JWTInvalid ||
            err instanceof JWTClaimValidationFailed ||
            err instanceof JWSSignatureVerificationFailed) {
            return {
                error: err,
                data: null
            };
        }

        // Should never happen
        throw err;
    }
}


export async function verifyJWT(
    idToken: string,
    projectId: string,
    fetchFn?: typeof globalThis.fetch
) {

    try {

        const { kid } = decodeProtectedHeader(idToken);

        if (!kid) {
            return {
                error: {
                    code: 500,
                    message: 'No KID found in token',
                    errors: []
                },
                data: null
            };
        }

        const { data, error } = await getJWKs(fetchFn);

        if (error) {
            return {
                error,
                data: null
            };
        }

        if (!data || !data.length) {
            return {
                error: {
                    code: 500,
                    message: 'No JWKs found',
                    errors: []
                },
                data: null
            };
        }

        const jwk = data.find(key => key.kid === kid);

        if (!jwk) {
            return {
                error: {
                    code: 500,
                    message: 'No matching JWK found',
                    errors: []
                },
                data: null
            };
        }

        const { payload } = await jwtVerify(idToken, jwk, {
            issuer: `https://securetoken.google.com/${projectId}`,
            audience: projectId,
            algorithms: ['RS256']
        });

        return {
            error: null,
            data: payload as FirebaseIdTokenPayload
        };

    } catch (err: unknown) {

        if (err instanceof JWTExpired ||
            err instanceof JWTInvalid ||
            err instanceof JWTClaimValidationFailed ||
            err instanceof JWSSignatureVerificationFailed) {
            return {
                error: err,
                data: null
            };
        }

        return {
            error: err as Error,
            data: null
        };
    }
}


export async function signJWT(
    serviceAccount: ServiceAccount
) {

    const { private_key, client_email } = serviceAccount;

    const OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";

    const SCOPES = [
        "https://www.googleapis.com/auth/datastore",
        "https://www.googleapis.com/auth/identitytoolkit",
        "https://www.googleapis.com/auth/devstorage.read_write"
    ] as const;

    try {

        const _private_key = private_key.replace(/\\n/g, '\n');

        console.log('First 30 chars:', _private_key.substring(0, 30));
        console.log('Includes BEGIN:', _private_key.includes('-----BEGIN PRIVATE KEY-----'));

        const key = await importPKCS8(_private_key, 'RS256');

        const token = await new SignJWT({ scope: SCOPES.join(' ') })
            .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
            .setIssuer(client_email)
            .setSubject(client_email)
            .setAudience(OAUTH_TOKEN_URL)
            .setIssuedAt()
            .setExpirationTime('1h')
            .sign(key);

        return {
            data: token,
            error: null
        };
    } catch (e: unknown) {

        if (e instanceof errors.JOSEError) {
            return {
                data: null,
                error: e
            };
        }

        return {
            data: null,
            error: e as Error
        };
    }
}

const RESERVED_CLAIMS = [
    'acr', 'amr', 'at_hash', 'aud', 'auth_time', 'azp', 'cnf', 'c_hash',
    'exp', 'iat', 'iss', 'jti', 'nbf', 'nonce', 'sub',
    'firebase', 'user_id'
];

export async function signJWTCustomToken(
    uid: string,
    serviceAccount: ServiceAccount,
    additionalClaims: object = {}
) {

    const { private_key, client_email } = serviceAccount;

    if (Object.keys(additionalClaims).some(k => RESERVED_CLAIMS.includes(k) || k.startsWith('firebase'))) {
        return {
            data: null,
            error: new Error(`Reserved claims (${RESERVED_CLAIMS.join(', ')}) cannot be used in additionalClaims`)
        };
    }

    const payload: Record<string, unknown> = { uid };
    if (Object.keys(additionalClaims).length) {
        payload.claims = additionalClaims;
    }

    const url = 'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit';

    try {
        const key = await importPKCS8(private_key, 'RS256');

        const token = await new SignJWT(payload)
            .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
            .setIssuer(client_email)
            .setSubject(client_email)
            .setAudience(url)
            .setIssuedAt()
            .setExpirationTime('1h')
            .sign(key);

        return {
            data: token,
            error: null
        };

    } catch (e: unknown) {

        if (e instanceof errors.JOSEError) {
            return {
                data: null,
                error: e
            };
        }

        return {
            data: null,
            error: e as Error
        };
    }
}