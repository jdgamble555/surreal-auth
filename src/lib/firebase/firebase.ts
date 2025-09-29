import { PRIVATE_GOOGLE_CLIENT_SECRET } from '$env/static/private';
import { PUBLIC_FIREBASE_CONFIG, PUBLIC_GOOGLE_CLIENT_ID } from '$env/static/public';
import type { FirebaseConfig } from './firebase-types';


export const firebase_config = JSON.parse(PUBLIC_FIREBASE_CONFIG) as FirebaseConfig;
export const client_id = PUBLIC_GOOGLE_CLIENT_ID;
export const client_secret = PRIVATE_GOOGLE_CLIENT_SECRET;


// Config Options
export const client_redirect_uri = '/auth/callback';
export const FIREBASE_ID_TOKEN = 'firebase_id_token';
export const FIREBASE_REFRESH_TOKEN = 'firebase_refresh_token';
export const DEFAULT_REDIRECT_PAGE = '/';


