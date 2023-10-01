import { ExtractJwt, JwtPayload, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import {
  BadGatewayException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "../config/config.service";
import { TenantsService } from "../tenants/tenants.service";
import { TokenType } from "../../helper/types";
import { constants, privateDecrypt } from "crypto";

/**
 * Jwt Strategy Class
 * req.user takes the shape of {
  _id: '6519779ec9db51a375d213ac',
  tenantId: 'string',
  access: 'tenantuser' | 'tenant'
}
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    readonly configService: ConfigService,
    private readonly tenantService: TenantsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get("WEBTOKEN_SECRET_KEY"),
      passReqToCallback: true,
    });
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

  /**
   * Checks if the bearer token is a valid token
   * @param {JwtPayload} jwtPayload validation method for jwt token
   * @param {any} done callback to resolve the request user with
   * @returns {Promise<boolean>} whether or not to validate the jwt token
   */
  async validate(
    req: Request,
    { iat, exp, _id, type }: JwtPayload,
    done,
  ): Promise<boolean> {
    const timeDiff = exp - iat;

    if (timeDiff <= 0) {
      throw new UnauthorizedException();
    }
    //

    try {
      const tenantId = req.headers["x-tenant-id"];
      const xAccessId = req.headers["x-access-id"];
      if (!xAccessId) {
        throw new UnauthorizedException("no x-access-id in headers");
      }

      const tenantUser = await this.decryptAccessToken(xAccessId);
      if (!tenantUser) {
        throw new UnauthorizedException();
      }

      // ensure _id on token and access token matches
      if (tenantUser._id !== _id) {
        throw new UnauthorizedException("No matching authorization.");
      }
      // validate tenantUser by accessToken
      if (type !== TokenType.tenant) {
        if (tenantUser.tenantId !== tenantId) throw new UnauthorizedException();
        done(null, { ...tenantUser, access: TokenType.tenantUser });
        return true;
      }

      let user = await this.tenantService.getById(_id);

      if (!user || user.portal !== tenantId) {
        throw new UnauthorizedException();
      }

      done(null, {
        _id: user._id,
        tenantId: user.portal,
        access: TokenType.tenant,
      });
      return true;
    } catch (error) {
      throw new BadGatewayException(error);
    }
  }
}
