import { ObjectId } from "mongoose"

export enum staffCategory {
    academics = "academics",
    nonAcademic = "non-academic"
}

export enum TokenType {
    tenant = "tenant",
    staff = "staff",
    student = "student",
    tenantUser = "tenantuser"
}
export type CreateToken = {
    type: TokenType,
    _id: ObjectId,
    identifier: string
}

export type Token = {
    expires: string;
    expiresPrettyPrint: string;
    token: string;
  }

export enum NotPermittedTenant  {
    register = "register",
    login = "login"
}

export type CreateAccessToken = {
    _id: ObjectId,
    // identifier: string,
    // userType: string,
    tenantId: string
}