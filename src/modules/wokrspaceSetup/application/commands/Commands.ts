import { ICommand } from "../../../../shared/ICommand";

export class CreateRealmCommand implements ICommand {
  constructor(readonly realmName: string) {}
}

export class CreateUserCommand implements ICommand {
  constructor(
    readonly realmName: string,
    readonly username: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly email: string,
    readonly password: string
  ) {}
}

export class LoginUserCommand implements ICommand {
  constructor(
    readonly username: string,
    readonly password: string,
    readonly realmName: string
  ) {}
}
