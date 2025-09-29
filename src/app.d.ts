// See https://svelte.dev/docs/kit/types#app.d.ts

import type { getFirebaseServer } from "$lib/firebase/firebase-server";

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			getFirebaseServer: typeof getFirebaseServer;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export { };
