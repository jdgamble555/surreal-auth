import { firebaseFetch, googleFetch } from "../core/rest-fetch";
import type {
    UserRecord,
    FirebaseCreateAuthUriResponse,
    FirebaseIdpSignInResponse,
    FirebaseRefreshTokenResponse,
    GoogleTokenResponse
} from "../core/firebase-types";

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
    client_secret: string,
    fetchFn?: typeof fetch
) {

    const url = 'https://oauth2.googleapis.com/token';

    const body = {
        code,
        client_id,
        client_secret,
        redirect_uri,
        grant_type: "authorization_code"
    };

    return await googleFetch<GoogleTokenResponse>(url, body, fetchFn);
}

export async function refreshFirebaseIdToken(
    refreshToken: string,
    apiKey: string,
    fetchFn?: typeof fetch
) {

    const url = `https://securetoken.googleapis.com/v1/token?key=${apiKey}`;

    const body = {
        grant_type: "refresh_token",
        refresh_token: refreshToken
    };

    return await googleFetch<FirebaseRefreshTokenResponse>(url, body, fetchFn);
}

export async function createAuthUri(
    redirect_uri: string,
    apiKey: string,
    fetchFn?: typeof fetch
) {

    const url = `https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=${apiKey}`;

    const body = {
        continueUri: redirect_uri,
        providerId: "google.com"
    };

    return await firebaseFetch<FirebaseCreateAuthUriResponse>(url, body, fetchFn);
}

export async function signInWithIdp(
    googleIdToken: string,
    requestUri: string,
    apiKey: string,
    fetchFn?: typeof fetch
) {

    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${apiKey}`;

    const body = {
        postBody: `id_token=${googleIdToken}&providerId=google.com`,
        requestUri,
        returnSecureToken: true
    };

    return await firebaseFetch<FirebaseIdpSignInResponse>(
        url,
        body,
        fetchFn
    );
}

export async function getUser(
    idToken: string,
    apiKey: string,
    fetchFn?: typeof fetch
) {

    const url = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`;

    const body = { idToken };

    const { data, error } = await googleFetch<UserRecord[]>(url, body, fetchFn);

    return {
        data: data?.length ? data[0] : null,
        error
    };
}

export async function getJWKs(fetchFn?: typeof fetch) {

    const url = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

    const { data, error } = await googleFetch<{ keys: (JsonWebKey & { kid: string })[] }>(
        url,
        undefined,
        fetchFn
    );

    return {
        data: data?.keys || null,
        error
    };
}

