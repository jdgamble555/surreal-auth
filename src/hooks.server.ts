import { PRIVATE_FIREBASE_ADMIN_CONFIG, PRIVATE_GOOGLE_CLIENT_SECRET } from "$env/static/private";
import { PUBLIC_FIREBASE_CONFIG, PUBLIC_GOOGLE_CLIENT_ID } from "$env/static/public";
import { FirebaseAuthServer } from "$lib/firebase/firebase-auth-server";
import type { Handle } from "@sveltejs/kit";

const firebaseAdminConfig = JSON.parse(PRIVATE_FIREBASE_ADMIN_CONFIG);
const firebaseConfig = JSON.parse(PUBLIC_FIREBASE_CONFIG);

export const handle: Handle = async ({ event, resolve }) => {

    event.locals.authServer = new FirebaseAuthServer({
        firebaseAdminConfig,
        firebaseConfig,
        providers: {
            google: {
                client_id: PUBLIC_GOOGLE_CLIENT_ID,
                client_secret: PRIVATE_GOOGLE_CLIENT_SECRET
            }
        },
        cookies: {
            getSession: (name) => event.cookies.get(name),
            saveSession: (name, value, options) => event.cookies.set(name, value, options)
        },
        fetch: event.fetch
    });

    return resolve(event);
};