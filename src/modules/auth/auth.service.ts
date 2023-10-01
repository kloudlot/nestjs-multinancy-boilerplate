import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "../config/config.service";
import { LoginDto } from "./payload/login.payload";
import { publicEncrypt, constants, privateDecrypt } from "crypto";
import { TenantDocument } from "../tenants/entities/tenant.entity";
import { TenantsService } from "../tenants/tenants.service";
import {
  CreateAccessToken,
  CreateToken,
  Token,
  TokenType,
} from "../../helper/types";
import { TenantUsersService } from "../tenant-users/tenant-users.service";
import { TenantUserDocument } from "../tenant-users/entities/tenant-user.entity";
//

/**
 * Models a typical Login/Register route return body
 */

/**
 * Authentication Service
 */
@Injectable()
export class AuthService {
  private readonly expiration: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tenantService: TenantsService,
    private readonly tenantUserService: TenantUsersService,
  ) {
    this.expiration = this.configService.get("WEBTOKEN_EXPIRATION_TIME");
  }

  async createToken(payload: CreateToken): Promise<string> {
    return this.generateToken(payload.type, payload);
  }

  generateToken(type: TokenType, { _id, identifier }: CreateToken) {
    switch (type) {
      case TokenType.tenant:
        return this.jwtService.sign({ _id, identifier, type });
      case TokenType.tenantUser:
        return this.jwtService.sign({ _id, identifier, type });
      default:
        throw new BadRequestException("Unable to sign user");
    }
  }

  //
  async createEncryptedText(dataToEncrypt) {
    const encryptedData = publicEncrypt(
      {
        key: `${this.configService.get("JSENCRYPT_PUBLIC")}`,
        padding: constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      Buffer.from(dataToEncrypt),
    );
    return encryptedData.toString("base64");
  }

  async getDecryptedText(encryptedData) {
    const decryptedData = privateDecrypt(
      {
        key: `${this.configService.get("JSDECRYPT_PRIVATE")}`,
        padding: constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      Buffer.from(encryptedData, "base64"),
    );
    return decryptedData.toString();
  }

  /**
   *
   * @param dataToEncrypt
   * @returns encrypted string of id_tenantId
   */
  async createAccessToken(dataToEncrypt: CreateAccessToken) {
    const encryptedData = publicEncrypt(
      {
        key: `${this.configService.get("JSENCRYPT_PUBLIC")}`,
        padding: constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      Buffer.from(`${dataToEncrypt._id}_${dataToEncrypt.tenantId}`),
    );
    return encryptedData.toString("base64");
  }

  /**
   *
   * @param encryptedData
   * @returns encrypted string of id_tenantId
   */

  async decryptAccessToken(encryptedData: string) {
    const decryptedData = privateDecrypt(
      {
        key: `${this.configService.get("JSDECRYPT_PRIVATE")}`,
        padding: constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      Buffer.from(encryptedData, "base64"),
    );

    const accessString = decryptedData.toString();
    const [_id, tenantId] = accessString.split("_");
    return {
      _id,
      tenantId,
    };
  }

  async validateTenant(payload: LoginDto): Promise<TenantDocument> {
    const user = await this.tenantService.validate(
      payload.identifier,
      payload.password,
    );
    if (!user) {
      return null;
    }
    return user;
  }

  async validateTenantUser(payload: LoginDto): Promise<TenantUserDocument> {
    const tenantUser = await this.tenantUserService.validate(
      payload.identifier,
      payload.password,
    );
    if (!tenantUser) {
      return null;
    }
    return tenantUser;
  }
}
