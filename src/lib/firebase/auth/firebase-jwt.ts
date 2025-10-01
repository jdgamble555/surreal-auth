import { decodeProtectedHeader, jwtVerify } from "jose";
import type { FirebaseIdTokenPayload } from "../core/firebase-types";
import {
    JWSSignatureVerificationFailed,
    JWTClaimValidationFailed,
    JWTExpired,
    JWTInvalid
} from "jose/errors";
import { getJWKs } from "./auth-endpoints";


async function getFirebasePublicJWK(kid: string) {

    const { data: keys, error } = await getJWKs();

    if (error) {
        throw new Error(`Failed to fetch JWKs: ${error.message}`);
    }

    if (!keys || !keys.length) {
        throw new Error('No JWKs found');
    }

    for (const jwk of keys) {
        if (jwk.kid === kid && jwk.alg === 'RS256' && jwk.kty === 'RSA' && jwk.use === 'sig') {
            return jwk;
        }
    }

    throw new Error(`Unable to find valid key with kid=${kid}`);
}


export async function verifyFirebaseToken(idToken: string, projectId: string) {

    try {

        const { kid } = decodeProtectedHeader(idToken);

        const jwks = await getFirebasePublicJWK(kid as string);

        const { payload } = await jwtVerify(idToken, jwks, {
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

        // Should never happen
        throw err;
    }
}

