import Email from "../../domain/entities/Email";
import Password from "../../domain/entities/Password";

export default interface ISSO {
  realmExists(realmName: string): Promise<boolean>;
  createRealm(realmName: string): Promise<void>;
  createClient(
    realmName: string,
    clientId: string,
    clientSecret: string
  ): Promise<string>;
  assignClientRoles(
    realmName: string,
    clientId: string,
    roles: Array<string>
  ): Promise<void>;
  createUser(
    realmName: string,
    username: string,
    firstName: string,
    lastName: string,
    email: Email,
    password: Password
  ): Promise<boolean>;

  loginUser(
    username: string,
    password: string,
    realmName: string,
    subdomainClientName: string,
    subdomainClientSecret: string
  ): Promise<string[]>;

  setClientSecret(
    realm: string,
    clientId: string,
    clientSecret: string
  ): Promise<string[]>;

  getCert(realmName: string): Promise<string>;
}
