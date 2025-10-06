import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { getPathname, getRedirectUri } from '$lib/svelte-helpers';

// TODO - redirect if logged in

export const actions = {

    google: async ({ locals: { authServer } }) => {

        const redirect_uri = getRedirectUri();
        const path = getPathname();

        const loginUrl = await authServer.getGoogleLoginURL(
            redirect_uri,
            path
        );

        redirect(302, loginUrl);
    },

    logout: async ({ locals: { authServer } }) => {

        authServer.signOut();

        redirect(302, '/');
    }

} satisfies Actions;