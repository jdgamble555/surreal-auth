import type { FirebaseRestError } from "./firebase-types";

export const restFetch = async <T, A>(
    url: string,
    body?: object,
    options?: {
        formEncode?: boolean;
        fetchFn?: typeof fetch;
    }
) => {

    const fetchFn = options?.fetchFn ?? fetch;
    const formEncode = options?.formEncode ?? false;

    const res = await fetchFn(url, {
        method: "POST",
        headers: {
            "Content-Type": formEncode
                ? "application/x-www-form-urlencoded"
                : "application/json"
        },
        body: body ? formEncode
            ? new URLSearchParams(body as Record<string, string>)
            : JSON.stringify(body) : undefined
    });

    if (res.headers.get("content-type")?.includes("application/json")) {

        // TODO - check ${res.status} ${res.statusText} 

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

    }

    if (!res.ok) {
        const error = await res.text() as A;

        return {
            data: null,
            error
        };
    }

    const data = await res.text() as T;

    return {
        data,
        error: null
    };
};

export const firebaseFetch = async <T>(url: string, body?: object, fetchFn?: typeof fetch) => {

    const { data, error } = await restFetch<T, FirebaseRestError>(url, body, { fetchFn });

    return {
        data,
        error: error ? error.error : null
    };
};

export const googleFetch = async <T>(url: string, body?: Record<string, string>, fetchFn?: typeof fetch) => {

    const { data, error } = await restFetch<T, FirebaseRestError>(url, body, { formEncode: true, fetchFn });

    return {
        data,
        error: error ? error.error : null
    };
};