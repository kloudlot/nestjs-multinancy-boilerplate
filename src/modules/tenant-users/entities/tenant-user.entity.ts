
import { Schema as SchemaMongoose, Document } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type TenantUserDocument = TenantUser & Document;

export enum TenancyUserType {
    dispatch = "dispatch",
    customer = "customer",
    tenant = "tenant",
}

@Schema({timestamps: true})
export class TenantUser {
    @Prop({
        required: true,
      })
      email: string;
    
      @Prop({
        required: true,
      })
      phoneNumber: string;

      @Prop({
        required: true,
      })
      password: string;

      @Prop({
        enum: TenancyUserType
      })
      type: string
}

export const TenantUserSchema = SchemaFactory.createForClass(TenantUser);
