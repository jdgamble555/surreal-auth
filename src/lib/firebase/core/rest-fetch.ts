export const restFetch = async <T, A>(
    url: string,
    options?: {
        body?: object;
        params?: Record<string, string>;
        form?: boolean;
        bearerToken?: string;
        fetchFn?: typeof fetch;
    }
) => {

    const fetchFn = options?.fetchFn ?? fetch;
    const form = options?.form ?? false;
    const bearerHeader = options?.bearerToken
        ? { 'Authorization': `Bearer ${options.bearerToken}` }
        : null;

    const query = options?.params
        ? '?' + new URLSearchParams(options.params)
        : '';

    const res = await fetchFn(url + query, {
        method: "POST",
        headers: {
            "Content-Type": form
                ? "application/x-www-form-urlencoded"
                : "application/json",
            ...bearerHeader
        },
        body: options?.body ? form
            ? new URLSearchParams(options.body as Record<string, string>)
            : JSON.stringify(options.body) : undefined
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
