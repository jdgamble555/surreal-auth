import { getUser } from "$lib/firebase/firebase";
import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load = (async ({ locals: { getFirebaseServer } }) => {

    const { data, error: firebaseError } = await getFirebaseServer();

    if (firebaseError) {
        error(400, firebaseError);
    }

    if (!data.auth) {
        return {
            user: null
        };
    }

    if (data.auth.currentUser === null) {
        return {
            user: null
        };
    }

    const user = getUser(data.auth.currentUser);

    return {
        user
    };

}) satisfies LayoutServerLoad;