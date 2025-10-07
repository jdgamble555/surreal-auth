/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'jsrsasign' {
    namespace KJUR {
        namespace jws {
            class JWS {
                static sign(alg: string, header: string, payload: string, key: any): string;
                static parse(jwt: string): { headerObj: any; payloadObj: any };
                static verify(jwt: string, key: any, options: { alg: string[] }): boolean;
            }
        }
    }
    namespace KEYUTIL {
        function getKey(pem: string): any;
    }
    function hex2b64(hex: string): string;
    function b64tohex(b64: string): string;
}