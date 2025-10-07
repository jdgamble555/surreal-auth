import { getRequestEvent } from "$app/server";
import {
    PRIVATE_SURREAL_DATABASE,
    PRIVATE_SURREAL_NAMESPACE,
    PRIVATE_SURREAL_PASSWORD,
    PRIVATE_SURREAL_USER
} from "$env/static/private";

const url = "https://bright-island-06cre2m569vkb7cmumqlhd5jg0.aws-use1.surreal.cloud";

const user = PRIVATE_SURREAL_USER;
const pass = PRIVATE_SURREAL_PASSWORD;
const ns = PRIVATE_SURREAL_NAMESPACE;
const db = PRIVATE_SURREAL_DATABASE;

export async function surrealQuery(query: string) {

    const { fetch } = getRequestEvent();

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain",
            "Accept": "application/json",
            "Authorization": "Basic " + Buffer.from(`${user}:${pass}`).toString("base64"),
            "Surreal-NS": ns,
            "Surreal-DB": db
        },
        body: query
    });

    if (!res.ok) {
        return {
            data: null,
            error: `Error ${res.status}: ${await res.text()}`
        };
    }

    return {
        data: await res.json(),
        error: null
    };
}

