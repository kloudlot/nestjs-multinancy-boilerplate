import {
  Controller,
  Body,
  Post,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./payload/login.payload";
import { TenantsService } from "../tenants/tenants.service";
import { TokenType } from "../../helper/types";
import { TenancyUserType } from "../tenant-users/entities/tenant-user.entity";
import { CreateTenantDto } from "../tenants/dto/create-tenant.dto";

/**
 * Authentication Controller
 */
@Controller("/tenancy")
@ApiTags("Authentication")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tenantService: TenantsService,
  ) {}

  @Post("login")
  @ApiResponse({ status: 201, description: "Login Completed" })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async login(@Body() payload: LoginDto, @Req() req: any): Promise<any> {
    const tenantId = req.headers["x-tenant-id"];

    const [tenant, tenantUser] = await Promise.all([
      this.authService.validateTenant(payload),
      this.authService.validateTenantUser(payload),
    ]);

    if (!tenant && !tenantUser) {
      throw new UnauthorizedException();
    }

    if (tenant) {
      const { roles, portal, _id } = tenant;
      const x_access = await this.authService.createAccessToken({
        _id,
        tenantId: portal,
      });
      const token: string = await this.authService.createToken({
        _id,
        identifier: payload.identifier,
        type: TokenType.tenant,
      });
      return {
        x_access,
        roles,
        portal,
        token: token,
        type: TokenType.tenant,
      };
    }

    if (tenantUser) {
      const { _id, type } = tenantUser;
      const x_access = await this.authService.createAccessToken({
        _id,
        tenantId,
      });

      const token: string = await this.authService.createToken({
        _id,
        identifier: payload.identifier,
        type: TokenType.tenantUser,
      });

      return {
        x_access,
        token: token,
        tokenType: TokenType.tenantUser,
        userType: type,
      };
    }
  }

  @Post("register")
  @ApiResponse({ status: 201, description: "Registration Completed" })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async register(
    @Body() payload: CreateTenantDto,
    @Req() req: any,
  ): Promise<any> {
    const tenant = await this.tenantService.createTenant(payload, req);

    const token = await this.authService.createToken({
      identifier: tenant.email,
      type: TokenType.tenant,
      _id: tenant._id,
    });

    const x_access = await this.authService.createAccessToken({
      _id: tenant._id,
      tenantId: tenant.portal,
    });

    return {
      x_access,
      token: token,
      tokenType: TokenType.tenantUser,
      userType: TenancyUserType.tenant,
    };
  }
}
