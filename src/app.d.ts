// See https://svelte.dev/docs/kit/types#app.d.ts

import type { FirebaseSettings } from "$lib/firebase/firebase-types";

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			firebase_settings: FirebaseSettings;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export { };
