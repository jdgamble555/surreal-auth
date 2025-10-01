
import { getUser } from "./auth-endpoints";
import { verifyFirebaseToken } from "./firebase-jwt";

export async function verifyIdToken(idToken: string, checkRevoked: boolean = false) {

    const { data: decodedIdToken, error: verifyError } = await verifyFirebaseToken(idToken);

    if (verifyError) {
        return {
            data: null,
            error: verifyError
        };
    }

    if (!checkRevoked) {
        return {
            data: decodedIdToken,
            error: null
        };
    }

    const { data: user, error: userError } = await getUser(idToken);

    if (userError) {
        return {
            data: null,
            error: userError
        };
    }

    if (!user) {
        return {
            data: null,
            error: {
                message: 'No user record found!',
                code: 'ERR_NO_USER'
            }
        };
    }

    if (user.tokensValidAfterTime) {

        // Get the ID token authentication time and convert to milliseconds UTC.
        const authTimeUtc = decodedIdToken!.auth_time * 1000;

        // Get user tokens valid after time in milliseconds UTC.
        const validSinceUtc = new Date(user.tokensValidAfterTime).getTime();

        // Check if authentication time is older than valid since time.

        if (authTimeUtc < validSinceUtc) {
            return {
                data: null,
                error: {
                    message: 'Token has been revoked!',
                    code: 'ERR_TOKEN_REVOKED'
                }
            };
        }
    }

    return {
        data: decodedIdToken,
        error: null
    };
}