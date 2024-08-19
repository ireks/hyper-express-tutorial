import HyperExpress from "hyper-express";
import { jwtDecode } from "jwt-decode";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

const app = new HyperExpress.Server();

interface Token {
  exp: number; // Token expiration time
  iat: number; // Token issued time
  iss: string;
  sub: string; // User identifier
  preferred_username: string; // User's username
  roles: string[]; // User roles
  password: string; // User's password stored in the token
  //
}


interface JWKS {
    keys: Array<{
      kid: string;
      kty: string;
      alg: string;
      use: string;
      n: string;
      e: string;
      x5c: string[];
    }>;
  }
  
  function getPublicKey(certFilePath: string, kid: string): string | null {
    try {
      const certPath = path.join(__dirname, certFilePath);
      const certData = fs.readFileSync(certPath, "utf8");
      const jwks: JWKS = JSON.parse(certData);
      const key = jwks.keys.find(key => key.kid === kid);
      if (!key) {
        console.error("Key with specified KID not found");
        return null;
      }
  
      return `-----BEGIN CERTIFICATE-----\n${key.x5c[0]}\n-----END CERTIFICATE-----`
  
    } catch (error) {
      console.error("Error reading the public key from JSON:", error);
      return null;
    }
  }




function getRealmFromToken(token:Token):string
{
    const parts = token.iss.split('/');
    const realm = parts[parts.length - 1];
    return realm;
    
}

function verifyToken(token: string): Token | null {
  try {

    
    const jsonToken = jwt.decode(token, { complete: true });
    console.log(jsonToken);
    if (!jsonToken || typeof jsonToken === 'string') {
      throw new Error("Invalid token");
    }
    
    
    const publicKey = getPublicKey(path.join("../../files/certs",getRealmFromToken(jsonToken.payload)+".cert"),jsonToken.header.kid);
    const tk=jwt.verify(token, publicKey,{ algorithms: [jsonToken.header.alg] }) as Token;

    // Check if the token has expired
    if (jsonToken.exp * 1000 < Date.now()) {
      console.warn("Token has expired");
      return null;
    }

    return jsonToken;
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
  console.log(token);
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }
  console.log(token);
  const verifiedToken = verifyToken(token);
  if (verifiedToken) {
    console.log("Token decoded and verified:", verifiedToken);
    req.locals.token = verifiedToken;
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
}
