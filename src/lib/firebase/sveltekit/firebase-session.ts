import { getRequestEvent } from "$app/server"

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

    const {
        cookies,
        locals: { firebase_settings }
    } = getRequestEvent();

    // set both cookies
    cookies.set(
        firebase_settings.id_token_cookie_name,
        id_token,
        COOKIE_OPTIONS
    );

    cookies.set(
        firebase_settings.refresh_token_cookie_name,
        refresh_token,
        COOKIE_OPTIONS
    );
}

export const getSession = () => {

    const {
        cookies,
        locals: { firebase_settings }
    } = getRequestEvent();

    const id_token = cookies.get(
        firebase_settings.id_token_cookie_name
    ) || null;

    const refresh_token = cookies.get(
        firebase_settings.refresh_token_cookie_name
    ) || null;

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

    const {
        cookies,
        locals: { firebase_settings }
    } = getRequestEvent();

    // remove both cookies
    cookies.delete(
        firebase_settings.id_token_cookie_name,
        COOKIE_OPTIONS
    );
    cookies.delete(
        firebase_settings.refresh_token_cookie_name,
        COOKIE_OPTIONS
    );
}


