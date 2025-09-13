import { constants, createHmac, publicEncrypt } from "crypto";
import base64url from "base64url";

export class EncryptionService {
  RSA_PUBLIC_KEY = base64url.decode(process.env.RSA_PUBLIC_KEY!);
  RSA_PRIVATE_KEY = base64url.decode(process.env.RSA_PRIVATE_KEY!);

  encrypt(text: string): string {
    const encryptedData = publicEncrypt(
      {
        key: this.RSA_PRIVATE_KEY,
        padding: constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      Buffer.from(text),
    );

    return encryptedData.toString("base64");
  }

  /**
   * Generates an HMAC using the SHA-256 hash function.
   * @param id - The user's id.
   * @param secretKey - The secret key (defaults to "secret").
   * @returns The generated HMAC as a hexadecimal string.
   */
  generateHmac(id: string | number, secretKey = "secret"): string {
    return createHmac("sha256", secretKey).update(id.toString()).digest("hex");
  }
}
