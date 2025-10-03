import { restFetch } from "../core/rest-fetch";
import type {
    UserRecord,
    FirebaseCreateAuthUriResponse,
    FirebaseIdpSignInResponse,
    FirebaseRefreshTokenResponse,
    GoogleTokenResponse,
    FirebaseRestError
} from "../core/firebase-types";

// Functions

function createIdentityURL(name: string) {
    return `https://identitytoolkit.googleapis.com/v1/accounts:${name}`;
}


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

    return await restFetch<GoogleTokenResponse, FirebaseRestError>(url, {
        fetchFn,
        body: {
            code,
            client_id,
            client_secret,
            redirect_uri,
            grant_type: "authorization_code"
        },
        form: true
    });
}

export async function refreshFirebaseIdToken(
    refreshToken: string,
    key: string,
    fetchFn?: typeof fetch
) {

    const url = `https://securetoken.googleapis.com/v1/token`;

    return await restFetch<FirebaseRefreshTokenResponse, FirebaseRestError>(url, {
        fetchFn,
        body: {
            grant_type: "refresh_token",
            refresh_token: refreshToken
        },
        params: {
            key
        },
        form: true
    });
}

export async function createAuthUri(
    redirect_uri: string,
    key: string,
    fetchFn?: typeof fetch
) {

    const url = createIdentityURL('createAuthUri');

    return await restFetch<FirebaseCreateAuthUriResponse, FirebaseRestError>(url, {
        fetchFn,
        body: {
            continueUri: redirect_uri,
            providerId: "google.com"
        },
        params: {
            key
        }
    });
}

export async function signInWithIdp(
    id_token: string,
    providerId: string = 'google.com',
    requestUri: string,
    key: string,
    fetchFn?: typeof fetch
) {

    const url = createIdentityURL('signInWithIdp');

    const postBody = new URLSearchParams({
        id_token,
        providerId
    }).toString();

    return await restFetch<FirebaseIdpSignInResponse, FirebaseRestError>(url, {
        fetchFn,
        body: {
            postBody,
            requestUri,
            returnSecureToken: true
        },
        params: {
            key
        }
    });
}

export async function getUser(
    idToken: string,
    key: string,
    fetchFn?: typeof fetch
) {

    const url = createIdentityURL('lookup');

    const { data, error } = await restFetch<UserRecord[], FirebaseRestError>(url, {
        fetchFn,
        body: {
            idToken
        },
        params: {
            key
        },
        form: true
    });

    return {
        data: data?.length ? data[0] : null,
        error
    };
}

export async function getJWKs(fetchFn?: typeof fetch) {

    const url = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

    const { data, error } = await restFetch<{ keys: (JsonWebKey & { kid: string })[] }, FirebaseRestError>(url, {
        fetchFn,
        form: true
    });

    return {
        data: data?.keys || null,
        error
    };
}

