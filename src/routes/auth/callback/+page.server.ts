import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { loginWithCode } from '$lib/firebase/sveltekit/firebase-server';

export const load: PageServerLoad = async ({ url }) => {

    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    const next = state ? JSON.parse(state).next : '/';

    if (!code) {
        error(400, 'Invalid URL!');
    }

    const { error: loginError } = await loginWithCode(code);

    if (loginError) {
        error(400, loginError);
    }

    redirect(302, next);
};