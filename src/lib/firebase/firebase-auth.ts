import { signInWithCustomToken, signInWithIdp } from "./firebase-auth-endpoints";
import type { FirebaseConfig } from "./firebase-types";


export class FirebaseAuth {


    constructor(
        private firebase_config: FirebaseConfig,
        private fetch?: typeof globalThis.fetch
    ) { }


    async signInWithProvider(
        idToken: string,
        requestUri: string
    ) {

        const {
            data: signInData,
            error: signInError
        } = await signInWithIdp(
            idToken,
            requestUri,
            this.firebase_config.apiKey,
            this.fetch
        );

        if (signInError) {
            return {
                data: null,
                error: signInError
            };
        }

        if (!signInData) {
            return {
                data: null,
                error: null
            };
        }

        return {
            data: signInData,
            error: null
        };
    }

    async signInWithCustomToken(
        customToken: string
    ) {
        const {
            data: signInData,
            error: signInError
        } = await signInWithCustomToken(
            customToken,
            this.firebase_config.apiKey,
            this.fetch
        );

        if (signInError) {
            return {
                data: null,
                error: signInError
            };
        }

        if (!signInData) {
            return {
                data: null,
                error: null
            };
        }
        
        return {
            data: signInData,
            error: null
        };
    }
}