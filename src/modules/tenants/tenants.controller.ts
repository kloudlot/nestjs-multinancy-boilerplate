import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  NotAcceptableException,
  ForbiddenException,
  Query,
  Next,
} from "@nestjs/common";
import { TenantsService } from "./tenants.service";
import { CreateTenantDto } from "./dto/create-tenant.dto";
import { UpdateTenantDto } from "./dto/update-tenant.dto";
import { ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { AppRoles } from "../app/app.roles";
import { ObjectId } from "mongoose";
import { NextFunction } from "express";
import * as uniqid from "uniqid";
@ApiTags("Tenants")
@Controller("api/tenants")
export class TenantsController {
  constructor(
    private readonly tenantsService: TenantsService,
  ) {}

  @Get("public")
  @UseGuards(AuthGuard("jwt"))
  async getMeBasic(@Req() req: any) {
    const client = req.user;
    console.log(req.user)
    return await this.tenantsService.getMeBasic(client.portal || client.tenantId);
  }


  // @Get("test")
  // @UseGuards(AuthGuard("jwt"))
  // test() {
  //   return "ok nice";
  // }

  // @Post("onboarding/:id")
  // @UseGuards(AuthGuard("jwt"))
  // async tenantOnboarding(@Body() body: any, @Param("id") id: ObjectId) {
  //   try {
  //     let tenantProfile = await this.tenantsService.getById(id);
  //     let accountRef = uniqid("kloudlot-", "-sms");
  //     const account: {
  //       message: string;
  //       status: boolean;
  //       data?: { accountNumber: string } | null;
  //     } = await this.kudaService.createVirtualAccount({
  //       businessName: tenantProfile.schoolName,
  //       phoneNumber: tenantProfile.schoolPhone,
  //       email: tenantProfile.schoolEmail,
  //       trackingReference: accountRef,
  //     });
  //     if (account.status) {
  //       await this.accountsService.create({
  //         accountNo: account.data.accountNumber,
  //         accountReference: accountRef,
  //         isMain: true
  //       });
  //     }
  //     tenantProfile.hasOnboarded = true;
  //     tenantProfile.isActive = true;
  //     await tenantProfile.save();

  //     return { message: "Account updated successfully" };
  //   } catch (error) {
  //     throw new NotAcceptableException("Server error");
  //   }
  // }
}
