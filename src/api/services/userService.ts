import mongoose from "mongoose";
import { IRole } from "../models/rolesModel";
import { IUser, User } from "../models/userModel";
import bcrypt from "bcrypt";
import generateRandomPassword from "../helpers/randomPassword";
import emailService from "./emailService";
import Permission from "../helpers/permissions";
import CustomError from "../../config/CustomError";

export interface ICheckUser {
  _id?: mongoose.Types.ObjectId;
  email?: string;
  refreshToken?: string;
}

export const checkUserExists = async ({
  email,
  refreshToken,
  _id,
}: ICheckUser) => {
  // replaced $or as it was creating confusion
  // this impl should also be as effective as $or operation
  if (_id) {
    const user = await User.findOne({ _id: _id }).populate<{ role_id: IRole }>(
      "role_id",
    );
    return user;
  }
  if (email) {
    const user = await User.findOne({ email: email }).populate<{
      role_id: IRole;
    }>("role_id");
    return user;
  }
  if (refreshToken) {
    const user = await User.findOne({ refreshToken: refreshToken }).populate<{
      role_id: IRole;
    }>("role_id");
    return user;
  }
  return null;
};

export const addRefreshToken = async (email, refreshToken) => {
  const user = await User.findOneAndUpdate(
    { email: email },
    { refreshToken: refreshToken },
    { returnDocument: "after" },
  ).populate<{ role_id: IRole }>("role_id");
  return user;
};

export const deleteRefreshToken = async (email) => {
  const user = await User.findOneAndUpdate(
    { email: email },
    { refreshToken: null },
    { returnDocument: "after" },
  ).populate<{ role_id: IRole }>("role_id");
  return user;
};

export const getAllUsers = async (query) => {
  const allUsers = await User.find(query).populate<{ role_id: IRole }>(
    "role_id",
  );
  return allUsers;
};

export const createNewUser = async (name: string, email: string) => {
  const password: string = generateRandomPassword(7);
  const hashed_password: string = await bcrypt.hash(password, 10);

  const user = await User.create({
    name: name,
    email: email,
    password: hashed_password,
  });

  const reg_mail = new emailService.RegisterationMail(user, password);
  await reg_mail.sendTo(email);
  if (!reg_mail) return null;

  return user;
};

type UpdateData = Partial<Pick<IUser, 'name' | 'bio' | 'password' | 'role_id' | 'extra_permissions' | 'removed_permissions'>>;

export const updateUser = async (id: string, data: UpdateData) => {
  try {
    const user = await User.findById(id);

    if (!user) {
      throw new CustomError(`User with id ${id} not found`, 404);
    }

      let allowedFields = ['name', 'bio', 'password'];

      // If the current user has permission to update profiles, allow them to update more fields
      if (user.extra_permissions?.includes(Permission.UpdateProfile)) {
        allowedFields = [...allowedFields, 'role_id', 'extra_permissions', 'removed_permissions'];
      }

      // Filter data to only include allowed fields
      const filteredData = Object.keys(data)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key as keyof UpdateData] = data[key];
        return obj;
      }, {} as UpdateData);

      // Check if password is being updated
      if (filteredData.password) {
        try {
          const hashed_password: string = await bcrypt.hash(filteredData.password, 10);
          filteredData.password = hashed_password;
        } catch (error) {
          throw new Error('Error hashing password');
        }
      }

      // Update the user
      try {
        const updatedUser = await User.findByIdAndUpdate(id, filteredData, {
          new: true,
          runValidators: true,
        });
  
        return updatedUser;
      } catch (error) {
        throw new Error('Error updating user in database');
      }
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};
