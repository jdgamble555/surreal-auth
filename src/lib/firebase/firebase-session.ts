import { getRequestEvent } from "$app/server"
import { FIREBASE_ID_TOKEN, FIREBASE_REFRESH_TOKEN } from "./firebase";
import { verifyIdToken } from "./firebase-admin";
import { refreshFirebaseIdToken } from "./firebase-auth";

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60
} as Parameters<ReturnType<typeof getRequestEvent>['cookies']['set']>[2];


export const saveSession = (
    id_token: string,
    refresh_token: string
) => {

    const { cookies } = getRequestEvent();

    // set both cookies
    cookies.set(
        FIREBASE_ID_TOKEN,
        id_token,
        COOKIE_OPTIONS
    );

    cookies.set(
        FIREBASE_REFRESH_TOKEN,
        refresh_token,
        COOKIE_OPTIONS
    );
}

export const getSession = () => {

    const { cookies } = getRequestEvent();

    const id_token = cookies.get(FIREBASE_ID_TOKEN) || null;
    const refresh_token = cookies.get(FIREBASE_REFRESH_TOKEN) || null;

    if (!id_token || !refresh_token) {
        //deleteSession();
        return {
            data: null
        };
    }

    return {
        data: {
            id_token,
            refresh_token
        }
    };
};

export const deleteSession = () => {

    const { cookies } = getRequestEvent();

    // remove both cookies
    cookies.delete(FIREBASE_ID_TOKEN, COOKIE_OPTIONS);
    cookies.delete(FIREBASE_REFRESH_TOKEN, COOKIE_OPTIONS);
}


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
