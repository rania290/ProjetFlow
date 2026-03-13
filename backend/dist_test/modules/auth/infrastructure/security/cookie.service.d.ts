import { Response } from 'express';
export declare class CookieService {
    private readonly isProd;
    setAuthCookies(res: Response, accessToken: string, refreshToken: string): void;
    clearAuthCookies(res: Response): void;
}
