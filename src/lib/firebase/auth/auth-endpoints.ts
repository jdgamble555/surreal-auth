import { firebaseFetch, googleFetch } from "../core/rest-fetch";
import type {
    UserRecord,
    FirebaseCreateAuthUriResponse,
    FirebaseIdpSignInResponse,
    FirebaseRefreshTokenResponse,
    GoogleTokenResponse
} from "../firebase-types";

// Functions

export function createGoogleOAuthLoginUrl(
    redirect_uri: string,
    pathname: string,
    client_id: string
) {

    return new URL(
        "https://accounts.google.com/o/oauth2/v2/auth?" +
        new URLSearchParams({
            client_id,
            redirect_uri,
            response_type: "code",
            scope: "openid email profile",
            access_type: "offline",
            prompt: "consent",
            state: JSON.stringify({ next: pathname })
        })
    ).toString();
}


export async function exchangeCodeForGoogleIdToken(
    code: string,
    redirect_uri: string,
    client_id: string,
    client_secret: string
) {

    const url = 'https://oauth2.googleapis.com/token';

    return await googleFetch<GoogleTokenResponse>(url, {
        code,
        client_id,
        client_secret,
        redirect_uri,
        grant_type: "authorization_code"
    });
}

export async function refreshFirebaseIdToken(
    refreshToken: string,
    apiKey: string
) {

    const url = `https://securetoken.googleapis.com/v1/token?key=${apiKey}`;

    return await googleFetch<FirebaseRefreshTokenResponse>(url, {
        grant_type: "refresh_token",
        refresh_token: refreshToken
    });
}

export async function createAuthUri(
    redirect_uri: string,
    apiKey: string
) {

    const url = `https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=${apiKey}`;

    return await firebaseFetch<FirebaseCreateAuthUriResponse>(url, {
        continueUri: redirect_uri,
        providerId: "google.com"
    });
}

export async function signInWithIdp(
    googleIdToken: string,
    requestUri: string,
    apiKey: string
) {

    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${apiKey}`;

    return await firebaseFetch<FirebaseIdpSignInResponse>(url, {
        postBody: `id_token=${googleIdToken}&providerId=google.com`,
        requestUri,
        returnSecureToken: true
    });
}

export async function getUser(
    idToken: string,
    apiKey: string
) {

    const url = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`;

    const { data, error } = await googleFetch<UserRecord[]>(url, {
        idToken
    });

    return {
        data: data?.length ? data[0] : null,
        error
    };
}


