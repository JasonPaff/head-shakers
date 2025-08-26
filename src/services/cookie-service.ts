import { deleteCookie, getCookie, setCookie } from 'cookies-next';

import { cookieConstants, type CookieKey, type CookieValue } from '@/constants/cookies';

export class CookieService {
  /**
   * Clear all cookies managed by this service
   */
  static clearAll(): void {
    for (const key in cookieConstants) {
      this.delete(key as CookieKey);
    }
  }

  /**
   * Delete a cookie
   */
  static delete<T extends CookieKey>(key: T): void {
    const config = cookieConstants[key];
    void deleteCookie(config.name, { path: '/' });
  }

  /**
   * Check if a cookie exists
   */
  static exists<T extends CookieKey>(key: T): boolean {
    const config = cookieConstants[key];
    return getCookie(config.name) !== undefined;
  }

  /**
   * Get a cookie value with type safety and fallback to default
   */
  static get<T extends CookieKey>(key: T): CookieValue<T> {
    const config = cookieConstants[key];
    const value = getCookie(config.name);
    return (value as CookieValue<T>) ?? config.defaultValue;
  }

  /**
   * Get all cookies managed by this service
   */
  static getAll(): Record<CookieKey, string> {
    const result = {} as Record<CookieKey, string>;

    for (const key in cookieConstants) {
      const cookieKey = key as CookieKey;
      result[cookieKey] = this.get(cookieKey);
    }

    return result;
  }

  /**
   * Set a cookie value with automatic configuration
   */
  static set<T extends CookieKey>(key: T, value: CookieValue<T>): void {
    const config = cookieConstants[key];
    void setCookie(config.name, value, {
      maxAge: config.maxAge,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }
}
