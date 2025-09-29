import { getFirebaseServer } from "$lib/firebase/firebase-server";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {

    event.locals.getFirebaseServer = getFirebaseServer;

    return resolve(event);
};