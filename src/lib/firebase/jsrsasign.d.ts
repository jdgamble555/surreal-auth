/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'jsrsasign' {
    namespace KJUR {
        namespace jws {
            class JWS {
                static sign(alg: string, header: string, payload: string, key: any): string;
            }
        }
    }
    namespace KEYUTIL {
        function getKey(pem: string): any;
    }
}