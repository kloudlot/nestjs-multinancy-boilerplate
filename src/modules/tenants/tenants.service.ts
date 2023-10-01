import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
  OnModuleInit,
  UnauthorizedException,
} from "@nestjs/common";

import { Model, ObjectId } from "mongoose";
import { TenantDocument, Tenants } from "./entities/tenant.entity";
import { AppRoles } from "../app/app.roles";
import * as crypto from "crypto";
import { InjectTenancyModel } from "@needle-innovision/nestjs-tenancy";
import * as uniqid from "uniqid";
import { CreateTenantDto } from "./dto/create-tenant.dto";

@Injectable()
export class TenantsService {
  constructor(
    @InjectTenancyModel(Tenants.name)
    private readonly tenantModel: Model<TenantDocument>,
  ) {}

  async getMe(portal: string): Promise<TenantDocument> {
    return await this.tenantModel.findOne({ portal }).populate(["settings"]);
  }
  async getMeBasic(portal: string): Promise<TenantDocument> {
    return await this.tenantModel.findOne({ portal });
  }

  getById(id: string | ObjectId): Promise<TenantDocument> {
    return this.tenantModel.findById(id).exec();
  }

  getByEmail(email: string): Promise<TenantDocument> {
    return this.tenantModel.findOne({ email }).exec();
  }

  async validateAccountExist(
    email: string,
    portal: string,
    phoneNumber: string,
  ): Promise<string[]> {
    const [emailUse, portalUse, phoneUse] = await Promise.all([
      this.tenantModel.findOne({ email }),
      this.tenantModel.findOne({ portal }),
      this.tenantModel.findOne({ phoneNumber }),
    ]);
    let existing = []
    if(emailUse){
      existing.push("Email")
    }
    if(portalUse){
      existing.push("Portal")
    }
    if(phoneUse){
      existing.push("Phone number")
    }

    return existing;
  }

  async getTenantByEmailAndPortal(
    email: string,
    portal: string,
  ): Promise<TenantDocument> {
    return await this.tenantModel.findOne({
      $and: [{ email: email }, { portal: portal }],
    });
    // .exec();
  }

  async validate(identifier: string, password: string): Promise<TenantDocument> {
    return this.tenantModel
      .findOne({
        email: identifier,
        password: crypto.createHmac("sha256", password).digest("hex"),
      })
      .exec();
  }

  async createTenant(
    payload: CreateTenantDto,
    req: any,
  ): Promise<TenantDocument> {
    try {
      // check if tenant exist on portal admin;
      const existing = await this.validateAccountExist(
        payload.email,
        payload.portal,
        payload.phoneNumber,
      );
      if (existing.length) {
        throw new NotAcceptableException(
          `The account with the provided ${existing.join(",")} currently exists.`,
        );
      }
      // this will auto assign the admin role to each created user
      const createdProfile = new this.tenantModel({
        ...payload,
        roles: AppRoles.ADMIN,
        password: crypto.createHmac("sha256", payload.password).digest("hex"),
      });

      return createdProfile.save();
    } catch (error) {
      console.log(error);
      throw new NotAcceptableException(error);
    }
  }
}
