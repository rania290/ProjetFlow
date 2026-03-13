"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CookieService = void 0;
const common_1 = require("@nestjs/common");
const auth_constants_1 = require("../../auth.constants");
let CookieService = class CookieService {
    isProd = process.env.NODE_ENV === 'production';
    setAuthCookies(res, accessToken, refreshToken) {
        res.cookie(auth_constants_1.ACCESS_TOKEN_COOKIE_NAME, accessToken, {
            httpOnly: true,
            secure: this.isProd,
            sameSite: 'lax',
            maxAge: auth_constants_1.ACCESS_TOKEN_EXPIRES_MS,
        });
        res.cookie(auth_constants_1.REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
            httpOnly: true,
            secure: this.isProd,
            sameSite: 'lax',
            maxAge: auth_constants_1.REFRESH_TOKEN_EXPIRES_MS,
        });
    }
    clearAuthCookies(res) {
        res.clearCookie(auth_constants_1.ACCESS_TOKEN_COOKIE_NAME);
        res.clearCookie(auth_constants_1.REFRESH_TOKEN_COOKIE_NAME);
    }
};
exports.CookieService = CookieService;
exports.CookieService = CookieService = __decorate([
    (0, common_1.Injectable)()
], CookieService);
//# sourceMappingURL=cookie.service.js.map