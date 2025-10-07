const PRINT_URL = false;

export const restFetch = async <T, A>(
    url: string,
    options?: {
        body?: object;
        params?: Record<string, string>;
        form?: boolean;
        bearerToken?: string;
        method?: "POST" | "GET";
        global?: {
            fetch?: typeof fetch;
        },
        headers?: Record<string, string>;
    }
): Promise<{ data: T | null; error: A | Error | null }> => {

    try {
        const fetchFn = options?.global?.fetch ?? fetch;
        const form = options?.form ?? false;
        const bearerHeader = options?.bearerToken
            ? { Authorization: `Bearer ${options.bearerToken}` }
            : null;

        const query = options?.params
            ? "?" + new URLSearchParams(options.params)
            : "";

        const res = await fetchFn(url + query, {
            method: options?.method ?? "POST",
            headers: {
                "Content-Type": form
                    ? "application/x-www-form-urlencoded"
                    : "application/json",
                ...bearerHeader,
                ...options?.headers,
            },
            body: options?.body
                ? form
                    ? new URLSearchParams(options.body as Record<string, string>)
                    : JSON.stringify(options.body)
                : undefined,
        });

        if (PRINT_URL) {
            console.log("restFetch", url + query);
        }

        const isJson = res.headers.get("content-type")?.includes("application/json");

        if (!res.ok) {
            const error = isJson
                ? (await res.json()) as A
                : (await res.text()) as unknown as A;
            return { data: null, error };
        }

        const data = isJson
            ? (await res.json()) as T
            : (await res.text()) as unknown as T;

        return { data, error: null };

    } catch (err) {
        
        // network error or unexpected exception
        return {
            data: null,
            error: err instanceof Error ? err : new Error(String(err)),
        };
    }
};
