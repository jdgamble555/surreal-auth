import { exchangeCodeForGoogleIdToken, signInWithIdp } from "./auth-endpoints";

export async function exchangeCodeForFirebaseToken(
    code: string,
    redirect_url: string,
    client_id: string,
    client_secret: string,
    requestUri: string,
    apiKey: string
) {

    const {
        data: uriData,
        error: uriError
    } = await exchangeCodeForGoogleIdToken(
        code,
        redirect_url,
        client_id,
        client_secret
    );

    if (uriError) {
        return {
            data: null,
            error: uriError
        };
    }

    if (!uriData) {
        return {
            data: null,
            error: null
        };
    }

    const {
        data: signInData,
        error: signInError
    } = await signInWithIdp(
        uriData.id_token,
        requestUri,
        apiKey
    );

    if (signInError) {
        return {
            data: null,
            error: signInError
        };
    }

    if (!signInData) {
        return {
            data: null,
            error: null
        };
    }

    return {
        data: signInData,
        error: null
    };
}