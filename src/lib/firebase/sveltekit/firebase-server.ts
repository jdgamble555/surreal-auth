import { refreshFirebaseIdToken } from "../auth/auth-endpoints";
import { verifyIdToken } from "../auth/firebase-admin";
import { deleteSession, getSession, saveSession } from "./firebase-session";


export const getVerifiedToken = async () => {

    const { data } = getSession();

    if (!data) {
        return {
            data: null,
            error: null
        };
    }

    const {
        error: verifyError,
        data: verifyData
    } = await verifyIdToken(data.id_token);

    if (verifyError) {

        // Auto refresh if expired
        if (verifyError.code === "ERR_JWT_EXPIRED") {

            const {
                data: refreshData,
                error: refreshError
            } = await refreshFirebaseIdToken(data.refresh_token);

            if (refreshError) {
                deleteSession();
                return {
                    data: null,
                    error: refreshError
                };
            }

            if (!refreshData) {
                deleteSession();
                return {
                    data: null,
                    error: null
                };
            }
            saveSession(
                refreshData.id_token,
                refreshData.refresh_token
            );
            return {
                data: refreshData.id_token,
                error: null
            };
        }
        return {
            data: null,
            error: verifyError
        };
    }

    if (!verifyData) {
        deleteSession();
        return {
            data: null,
            error: null
        };
    }

    return {
        data: data.id_token,
        error: null
    };
};


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