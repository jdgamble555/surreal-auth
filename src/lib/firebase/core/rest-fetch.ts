import { getRequestEvent } from "$app/server";
import type { FirebaseRestError } from "../firebase-types";

export const restFetch = async <T, A>(
    url: string,
    body: object,
    options?: {
        formEncode: boolean;
    }
) => {

    const { fetch } = getRequestEvent();

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": options?.formEncode
                ? "application/x-www-form-urlencoded"
                : "application/json"
        },
        body: options?.formEncode
            ? new URLSearchParams(body as Record<string, string>)
            : JSON.stringify(body)
    });

    if (!res.ok) {
        const error = await res.json() as A;

        return {
            data: null,
            error
        };
    }

    const data = await res.json() as T;

    return {
        data,
        error: null
    };
};

export const firebaseFetch = async <T>(url: string, body: object) => {

    const { data, error } = await restFetch<T, FirebaseRestError>(url, body);

    return {
        data,
        error: error ? error.error : null
    };
};

export const googleFetch = async <T>(url: string, body: Record<string, string>) => {

    const { data, error } = await restFetch<T, FirebaseRestError>(url, body, { formEncode: true });

    return {
        data,
        error: error ? error.error : null
    };
};