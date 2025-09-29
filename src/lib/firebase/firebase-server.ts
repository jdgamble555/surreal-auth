import { deleteSession, getVerifiedToken, saveSession } from "./firebase-session";
import { exchangeCodeForFirebaseToken } from "./firebase-auth";

export const getFirebaseServer = async () => {

    const {
        data: authIdToken,
        error: verifyError
    } = await getVerifiedToken();

    if (verifyError) {

        return {
            data: {
                auth: null
            },
            error: verifyError
        };
    }

    if (!authIdToken) {

        return {
            error: null,
            data: {
                auth: null
            }            
        };
    }

    // Login with the token

    const { db, auth } = await firebaseServer(authIdToken);

    if (auth.currentUser === null) {
        return {
            error: new Error('Invalid Token'),
            data: {
                db,
                auth: null
            }            
        };
    }

    return {
        error: null,
        data: {
            db,
            auth
        }
    };
};

export const logout = () => deleteSession();

export const loginWithCode = async (code: string) => {

    const {
        data: exchangeData,
        error: exchangeError
    } = await exchangeCodeForFirebaseToken(code);

    if (exchangeError) {
        return {
            error: exchangeError
        };
    }

    if (!exchangeData) {
        return {
            error: new Error('No exchange data!')
        };
    }

    saveSession(
        exchangeData.idToken,
        exchangeData.refreshToken
    );

    return {
        error: null
    };
};