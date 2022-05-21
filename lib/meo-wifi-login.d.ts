interface meoLoginResponse {
    result: boolean;
    error: string | null;
    RedirectUrlEN: string;
    RedirectUrlPT: string;
}
interface logoffResponse {
    success: boolean;
    statusCode: number;
    url: string;
}
interface loginResponse {
    success: boolean;
    response: meoLoginResponse;
    statusCode: number;
    url: string;
    cryptoPassword: string;
}
export declare const meoWifiLogoff: () => Promise<logoffResponse>;
export declare const encryptPassword: (password: string, ip: string) => string;
export declare const meoWifiLogin: (username: string, password: string, ip: string) => Promise<loginResponse>;
export {};
