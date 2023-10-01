import { Injectable } from "@nestjs/common";
import { CreateTenantUserDto } from "./dto/create-tenant-user.dto";
import { UpdateTenantUserDto } from "./dto/update-tenant-user.dto";
import { InjectTenancyModel } from "@needle-innovision/nestjs-tenancy";
import { TenantUser, TenantUserDocument } from "./entities/tenant-user.entity";
import { Model } from "mongoose";
import * as crypto from "crypto";

@Injectable()
export class TenantUsersService {
  constructor(
    @InjectTenancyModel(TenantUser.name)
    private readonly TenancyUsers: Model<TenantUserDocument>,
  ) {}

  //
  async validate(
    identifier: string,
    password: string,
  ): Promise<TenantUserDocument> {
    return await this.TenancyUsers.findOne({
      $and: [
        { $or: [{ phoneNumber: identifier }, { email: identifier }] },
        { password: crypto.createHmac("sha256", password).digest("hex") },
      ],
    });
  }

  async create(createTenantUserDto: CreateTenantUserDto) {
    const create = await this.TenancyUsers.create({
      ...createTenantUserDto,
      password: crypto.createHmac("sha256", createTenantUserDto.password).digest("hex"),
    });
    return await create.save();
  }

  findAll() {
    return `This action returns all tenantUsers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tenantUser`;
  }

  update(id: number, updateTenantUserDto: UpdateTenantUserDto) {
    return `This action updates a #${id} tenantUser`;
  }

  remove(id: number) {
    return `This action removes a #${id} tenantUser`;
  }
}
