// Importing the jsonwebtoken module and the necessary types
import jwt, { SignOptions, VerifyErrors, VerifyCallback } from 'jsonwebtoken';

// Define an interface for the user information object
interface UserInfo {
  userName: string;
  [key: string]: any; // Allows for additional properties
}

// Function to generate a JWT token
// Takes a UserInfo object and returns a signed token string or null
export const generateToken = (userInfo: UserInfo | null): string | null => {
  if (!userInfo) {
    return null;
  }

  // Signing the token with user information and a secret key, and setting an expiration time
  const token = jwt.sign(userInfo, process.env.JWT_SECRET as string, {
    expiresIn: "1h",
  } as SignOptions);

  return token;
};

// Define an interface for the response from verifyToken
export  interface VerifyTokenResponse {
  verified: boolean;
  message: string;
}

// Function to verify a JWT token
// Takes a userName and a token, and returns a response object indicating verification status
export const verifyToken = (userName: string, token: string): Promise<VerifyTokenResponse> => {
  return new Promise((resolve) => {
    jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
      if (err) {
        resolve({ verified: false, message: "Invalid token" });
      } else {
        const response = decoded as UserInfo;
        if (response.userName !== userName) {
          resolve({ verified: false, message: "Invalid user" });
        } else {
          resolve({ verified: true, message: "Verified" });
        }
      }
    });
  });
};
