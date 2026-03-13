export class ValidationHelper {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPassword(password: string): boolean {
    return password.length >= 6;
  }

  static isValidName(name: string): boolean {
    return name.length >= 2 && name.length <= 50;
  }

  static sanitizeString(input: string): string {
    return input.trim().replace(/\s+/g, ' ');
  }
}

