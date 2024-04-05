import mongoose, { Document, Schema } from "mongoose";
import Permission from "../helpers/permissions";
import { IRole } from "./rolesModel";
import MainWebsiteRole from "../helpers/mainWebsiteRole";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  refreshToken?: string;
  passwordResetToken?: string;
  role_id: mongoose.Schema.Types.ObjectId;
  bio: string;
  extra_permissions?: Permission[];
  removed_permissions?: Permission[];
  date_joined: Date;
  show?: boolean;
  team_role: MainWebsiteRole;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
    },
    bio: {
      type: String,
      default: "error 404: bio not found :)",
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
    },
    refreshToken: {
      type: String,
    },
    passwordResetToken: {
      type: String,
    },
    role_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "role",
      // warn: default role from env
      default: new mongoose.Types.ObjectId(process.env.DEFAULT_ROLE_ID),
    },
    extra_permissions: {
      type: [Number],
      enum: Object.values(Permission).filter(
        (value) => typeof value === "number",
      ),
    },
    show: {
      type: Boolean,
      default: false,
    },
    removed_permissions: {
      type: [Number],
      enum: Object.values(Permission).filter(
        (value) => typeof value === "number",
      ),
    },
    date_joined: {
      type: Date,
    },
    team_role: {
      type: Number,
      enum: MainWebsiteRole,
      default: MainWebsiteRole.DoNotDisplay,
    },
  },
  {
    timestamps: {
      createdAt: "date_joined",
      updatedAt: false,
    },
  },
);

const User = mongoose.model("user", userSchema);
type PopulatedUser = Omit<IUser, "role_id"> & { role_id: IRole };

export { User, PopulatedUser };
