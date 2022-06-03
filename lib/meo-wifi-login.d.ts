interface logoffResponse {
    success: boolean;
    statusCode: number;
    url: string;
}
interface loginResponse {
    success: boolean;
    message: string;
    statusCode: number;
    url: string;
    returnedIP: string;
    cryptoPassword: string;
}
export declare const meoWifiLogoff: () => Promise<logoffResponse>;
export declare const encryptPassword: (password: string, ip: string) => string;
export declare const meoWifiLogin: (username: string, password: string, ip: string) => Promise<loginResponse>;
export {};
