import { getAbout } from "$lib/about";
import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";


export const load = (async ({ locals: { getFirebaseServer }, parent, url }) => {

    const { user } = await parent();

    // Block access if not authenticated
    // Although need Firestore Rules to prevent access on client
    if (!user) {
        redirect(302, '/login?next=' + url.pathname);
    }

    const { data, error: firebaseError } = await getFirebaseServer();

    if (firebaseError) {
        error(400, firebaseError);
    }

    const { db } = data;

    return {
        about: await getAbout(db)
    };

}) satisfies PageServerLoad;