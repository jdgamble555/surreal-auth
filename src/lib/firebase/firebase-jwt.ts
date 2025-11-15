import {
    decodeProtectedHeader,
    errors,
    jwtVerify,
    importX509
} from "jose";

import { SignJWT } from 'jose/jwt/sign';
import { importPKCS8 } from 'jose/key/import';

import {
    JWSSignatureVerificationFailed,
    JWTClaimValidationFailed,
    JWTExpired,
    JWTInvalid
} from "jose/errors";
import type { FirebaseIdTokenPayload, ServiceAccount } from "./firebase-types";
import { getJWKs, getPublicKeys } from "./firebase-auth-endpoints";


interface ErrorResponse {
    code: number;
    message: string;
    errors?: {
        message: string;
        domain: string;
        reason: string;
    }[];
}

interface JwtResult {
    data: FirebaseIdTokenPayload | null;
    error: ErrorResponse | null;
}

// import { JwtResult, FirebaseIdTokenPayload } from './your-types';
// import { getPublicKeys } from './getPublicKeys';

export async function verifySessionJWT(
    sessionCookie: string,
    projectId: string,
    fetchFn: typeof globalThis.fetch = globalThis.fetch
): Promise<JwtResult> {
    try {
        // Fetch public keys (same as original)
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

        // Decode JWT header to get kid
        const header = decodeProtectedHeader(sessionCookie);

        if (!header.kid || typeof header.kid !== 'string' || !data[header.kid]) {
            return {
                error: {
                    code: 500,
                    message: 'No KID found in token or no matching public key',
                    errors: []
                },
                data: null
            };
        }

        const certificate = data[header.kid];

        // Import X.509 certificate as public key
        const publicKey = await importX509(certificate, 'RS256');

        const expectedIssuer = `https://session.firebase.google.com/${projectId}`;
        const expectedAudience = projectId;

        // Verify JWT (signature + iss/aud + exp/nbf)
        const { payload } = await jwtVerify(sessionCookie, publicKey, {
            issuer: expectedIssuer,
            audience: expectedAudience,
            algorithms: ['RS256']
        });

        return {
            error: null,
            data: payload as FirebaseIdTokenPayload
        };
    } catch (err: unknown) {
        // Map jose errors to your error shape
        if (err instanceof Error) {
            if (err.name === 'JWTExpired') {
                return {
                    error: {
                        code: 401,
                        message: 'JWT has expired',
                        errors: []
                    },
                    data: null
                };
            }

            if (err.name === 'JWTClaimValidationFailed') {
                return {
                    error: {
                        code: 401,
                        message: `JWT claim validation failed: ${err.message}`,
                        errors: []
                    },
                    data: null
                };
            }

            if (err.name === 'JWSVerificationFailed' || err.name === 'JWSSignatureVerificationFailed') {
                return {
                    error: {
                        code: 401,
                        message: 'JWT signature verification failed',
                        errors: []
                    },
                    data: null
                };
            }
        }

        // Fallback generic error
        return {
            error: {
                code: 500,
                message: err instanceof Error ? err.message : 'Unknown error during JWT verification',
                errors: []
            },
            data: null
        };
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

    const OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';

    const SCOPES = [
        'https://www.googleapis.com/auth/datastore',
        'https://www.googleapis.com/auth/identitytoolkit',
        'https://www.googleapis.com/auth/devstorage.read_write'
    ] as const;

    try {
        // Firebase puts "\n" in JSON, normalize to real newlines for PEM
        const normalizedKey = private_key.replace(/\\n/g, '\n');

        // Import PKCS#8 private key for RS256
        const key = await importPKCS8(normalizedKey, 'RS256');

        // Build JWT with jose
        const jwt = new SignJWT({ scope: SCOPES.join(' ') })
            .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
            .setIssuer(client_email)
            .setSubject(client_email)
            .setAudience(OAUTH_TOKEN_URL)
            .setIssuedAt()
            .setExpirationTime('1h');

        const token = await jwt.sign(key);

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

        if (e instanceof Error) {
            return {
                data: null,
                error: e
            };
        }

        return {
            data: null,
            error: {
                message: e
            }
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