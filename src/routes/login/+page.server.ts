import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createGoogleOAuthLoginUrl } from '$lib/firebase/firebase-auth';
import { logout } from '$lib/firebase/firebase-server';

// TODO - redirect if logged in

export const actions = {

    google: async () => {

        logout();

        const loginUrl = createGoogleOAuthLoginUrl();

        redirect(302, loginUrl);
    },

    logout: async () => {

        logout();

        redirect(302, '/');
    }

} satisfies Actions;