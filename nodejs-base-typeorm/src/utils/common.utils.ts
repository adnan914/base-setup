import { SignOptions, sign } from "jsonwebtoken";

export class CommonUtils {
  static generateToken(data: any, secret: string, options: SignOptions): string {
    return sign(data, secret, { expiresIn: options.expiresIn });
  }

  static generateRandomString(length: number): string {
    return Math.random().toString(36).substring(2, 2 + length);
  }
}
