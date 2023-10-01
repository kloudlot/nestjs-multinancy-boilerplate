import { Schema as SchemaMongoose, Document } from "mongoose";
import { AppRoles } from "../../app/app.roles";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

/**
 * Mongoose Tenants Schema
 */

export type TenantDocument = Tenants & Document;

@Schema({timestamps: true})
export class Tenants {
  @Prop({
    type: String,
  })
  email: string;

  @Prop({
    type: String,
    required: true
  })
  password: string;

  @Prop({
    type: Array,
    default: [AppRoles.ADMIN],
  })
  roles: AppRoles;

  @Prop({
    type: String,
  })
  portal: string;

  @Prop({
    type: String,
  })
  phoneNumber: string;

  @Prop({default: false})
  hasOnboarded: boolean

  @Prop({default: false})
  isActive: boolean

  // @Prop({
  //   type: SchemaMongoose.Types.ObjectId,
  //   ref: "Settings",
  // })
  // settings: typeof SettingsSchema;

  // @Prop({
  //   type: [SchemaMongoose.Types.ObjectId],
  //   ref: "Employees",
  // })
  // employees: typeof EmployeeSchema[];
}

export const TenantSchema = SchemaFactory.createForClass(Tenants);
