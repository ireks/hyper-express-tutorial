import Joi from "joi";
import ValidationError from "../../../../shared/Errors/ValidationError";
import Email from "../../domain/entities/Email";
import Password from "../../domain/entities/Password";
const schema = Joi.object({
  keycloakUrl: Joi.string().required().messages({
    "any.required": "keycloakUrl is a required field",
  }),
  adminRealm: Joi.string().required().messages({
    "any.required": "adminRealm is a required field",
  }),
  adminClientId: Joi.string().required().messages({
    "any.required": "adminClientId is a required field",
  }),
  adminClientSecret: Joi.string().required().messages({
    "any.required": "adminClientSecret is a required field",
  }),
});

export default class SSO {
  constructor(
    readonly keycloakUrl: string,
    readonly adminRealm: string,
    readonly adminClientId: string,
    readonly adminClientSecret: string
  ) {
    this.validate(this);
  }

  private validate(sso: object): void {
    const { error } = schema.validate(sso, {
      abortEarly: false,
    });
    if (error) {
      const validationErrors = error.details.map((detail) => detail.message);
      throw new ValidationError(validationErrors);
    }
  }

  private async getAccessToken(): Promise<string> {
    try {
      const response = await fetch(
        `${this.keycloakUrl}/realms/${this.adminRealm}/protocol/openid-connect/token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "client_credentials",
            client_id: this.adminClientId,
            client_secret: this.adminClientSecret,
          }).toString(),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to obtain access token: ${response.statusText}`
        );
      }

      const data = await response.json();
      data.access_token;
      return data.access_token;
    } catch (error: any) {
      console.error(`Error in getAccessToken: ${error.message}`);
      throw error;
    }
  }

  public async realmExists(realmName: string): Promise<boolean> {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(
        `${this.keycloakUrl}/admin/realms/${realmName}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status == 404) {
        return false;
      }
      return true;
    } catch (error: any) {
      throw error;
    }
  }

  public async createRealm(realmName: string): Promise<void> {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(`${this.keycloakUrl}/admin/realms`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          realm: realmName,
          enabled: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create realm: ${response.statusText}`);
      }
    } catch (error: any) {
      throw error;
    }
  }

  async createUser(
    realmName: string,
    username: string,
    firstName: string,
    lastName: string,
    email: Email,
    password: Password
  ): Promise<boolean> {

    console.log("to jest" +realmName);
    const createUserUrl = `${this.keycloakUrl}/admin/realms/${realmName}/users`;
    const userData = {
      username: username,
      enabled: true,
      firstName: firstName,
      lastName: lastName,
      email: email,
      credentials: [
        {
          type: "password",
          value: password,
          temporary: false,
        },
      ],
    };

    const token = this.getAccessToken();
    const response = await fetch(createUserUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Error creating user: ${response.status} ${
          response.statusText
        } - ${JSON.stringify(errorData)}`
      );
    }

    console.log("User created successfully");
    return true;
  }

  public async createClient(
    realmName: string,
    clientId: string
  ): Promise<string> {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(
        `${this.keycloakUrl}/admin/realms/${realmName}/clients`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientId,
            enabled: true,
            publicClient: true,
            directAccessGrantsEnabled: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create client: ${response.statusText}`);
      }

      const locationHeader = response.headers.get("location");
      if (!locationHeader) {
        throw new Error("Failed to get client UUID from response headers.");
      }

      const clientUuid = locationHeader.split("/").pop()!;

      return clientUuid;
    } catch (error: any) {
      throw error;
    }
  }

  public async assignClientRoles(
    realmName: string,
    clientId: string,
    roles: Array<string>
  ): Promise<void> {
    try {
      const token = await this.getAccessToken();

      for (const roleName of roles) {
        const response = await fetch(
          `${this.keycloakUrl}/admin/realms/${realmName}/clients/${clientId}/roles`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: roleName,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to create role "${roleName}": ${response.statusText}`
          );
        }
      }
    } catch (error: any) {
      throw error;
    }
  }

  public async createMapper(
    realmName: string,
    clientId: string
  ): Promise<void> {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(
        `${this.keycloakUrl}/admin/realms/${realmName}/clients/${clientId}/protocol-mappers/models`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "realm-roles-mapper",
            protocol: "openid-connect",
            protocolMapper: "oidc-usermodel-realm-role-mapper",
            consentRequired: false,
            config: {
              multivalued: "true",
              "user.attribute": "roles",
              "id.token.claim": "true",
              "access.token.claim": "true",
              "claim.name": "role",
              "jsonType.label": "String",
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create mapper: ${response.statusText}`);
      }
    } catch (error: any) {
      throw error;
    }
  }
}
