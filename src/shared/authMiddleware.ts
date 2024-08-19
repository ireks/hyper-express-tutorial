import HyperExpress from "hyper-express";
import { jwtDecode } from "jwt-decode";

const app = new HyperExpress.Server();

interface Token {
  exp: number; // Token expiration time
  iat: number; // Token issued time
  sub: string; // User identifier
  preferred_username: string; // User's username
  roles: string[]; // User roles
  password: string; // User's password stored in the token
  //
}

function verifyToken(token: string): Token | null {
  try {
    const decodedToken = jwtDecode<Token>(token);

    // Check if the token has expired
    if (decodedToken.exp * 1000 < Date.now()) {
      console.warn("Token has expired");
      return null;
    }

    return decodedToken;
  } catch (error) {
    console.error("Error decoding the token:", error);
    return null;
  }
}

function extractTokenFromHeader(header: string): string | null {
  if (header && header.startsWith("Bearer ")) {
    return header.slice(7);
  }
  return null;
}

export default async function authMiddleware(
  req: HyperExpress.Request,
  res: HyperExpress.Response,
  next: Function
) {
  const header = req.header("Authorization");
  const token = extractTokenFromHeader(header);
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }

  const verifiedToken = verifyToken(token);
  if (verifiedToken) {
    console.log("Token decoded and verified:", verifiedToken);
    req.locals.token=verifiedToken;
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
}
