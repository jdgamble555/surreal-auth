import { getRequestEvent } from "$app/server";
import {
    PRIVATE_SURREAL_DATABASE,
    PRIVATE_SURREAL_NAMESPACE,
    PRIVATE_SURREAL_PASSWORD,
    PRIVATE_SURREAL_USERNAME
} from "$env/static/private";

const url = "https://bright-island-06cre2m569vkb7cmumqlhd5jg0.aws-use1.surreal.cloud/sql";

const ns = PRIVATE_SURREAL_NAMESPACE;
const db = PRIVATE_SURREAL_DATABASE;
const username = PRIVATE_SURREAL_USERNAME;
const password = PRIVATE_SURREAL_PASSWORD;

// Base64 encode credentials for Basic Auth
const credentials = btoa(`${username}:${password}`);

export async function surrealQuery(query: string) {

    const { fetch } = getRequestEvent();

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain",
            "Accept": "application/json",
            "Authorization": "Basic " + credentials,
            "Surreal-NS": ns,
            "Surreal-DB": db
        },
        body: query
    });

    if (!res.ok) {
        throw new Error(`Error ${res.status}: ${await res.text()}`);
    }

    return res.json();
}

