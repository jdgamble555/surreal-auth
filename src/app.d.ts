// See https://svelte.dev/docs/kit/types#app.d.ts

import type { FirebaseAuthServer } from "$lib/firebase-auth-server";

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			authServer: FirebaseAuthServer
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export { };
