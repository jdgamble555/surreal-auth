import { PRIVATE_GOOGLE_CLIENT_SECRET } from "$env/static/private";
import { PUBLIC_GOOGLE_CLIENT_ID } from "$env/static/public";
import { PUBLIC_FIREBASE_CONFIG } from "$env/static/public";
import type { Handle } from "@sveltejs/kit";

export const firebase_config = JSON.parse(PUBLIC_FIREBASE_CONFIG);


export const handle: Handle = async ({ event, resolve }) => {

    event.locals.firebase_settings = {
        config: firebase_config,
        client_redirect_uri: '/auth/callback',
        default_redirect_page: '/',
        id_token_cookie_name: 'firebase_id_token',
        refresh_token_cookie_name: 'firebase_refresh_token',
        providers: {
            google: {
                client_id: PUBLIC_GOOGLE_CLIENT_ID,
                client_secret: PRIVATE_GOOGLE_CLIENT_SECRET
            }
        }
    };

    return resolve(event);
};