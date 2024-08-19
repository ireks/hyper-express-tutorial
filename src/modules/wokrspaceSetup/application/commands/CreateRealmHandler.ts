import { ICommandHandler } from "../../../../shared/ICommandHandler";
import { CreateRealmCommand } from "./Commands";
import Joi from "joi";
import ValidationError from "../../../../shared/Errors/ValidationError";
import ISSO from "../services/ISSO";

const schema = Joi.string()
  .pattern(/^(?=.{1,253}$)((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,63}$/)
  .required()
  .messages({
    "string.pattern.base": "Realm name must be a valid realm",
    "string.empty": "Realm name cannot be empty",
    "any.required": "Realm name is required",
  });

export class CreateRealmHandler
  implements ICommandHandler<CreateRealmCommand, void>
{
  constructor(
    readonly sso: ISSO,
    readonly subdomainClientName: string,
    readonly subdomainClientSecret: string
  ) {}

  async handle(command: CreateRealmCommand): Promise<void> {
    const realmName = command.realmName;
    this.validate(realmName);
    await this.createDNSDomain(realmName);
    await this.configureRealm(realmName);
  }

  protected async createDNSDomain(realmName: string) {}

  protected async configureRealm(realmName: string) {
    const roles = ["Admin", "Agent", "Supervisor"];

    await this.sso.createRealm(realmName);
    const clientUuid = await this.sso.createClient(
      realmName,
      this.subdomainClientName,
      this.subdomainClientSecret
    );
    await this.sso.assignClientRoles(realmName, clientUuid, roles);
  }

  private validate(realmName: string): void {
    const { error } = schema.validate(realmName, {
      abortEarly: false,
    });
    if (error) {
      const validationErrors = error.details.map((detail) => detail.message);
      throw new ValidationError(validationErrors);
    }
  }
}
