import { Schema, model } from 'mongoose';
import { TUser } from './user.interface';
import config from '../../config';
import bcrypt from 'bcrypt';
import { Roles, Statuses } from './user.constant';

const userSchema = new Schema<TUser>(
  {
    id: {
      type: String,
      required: [true, 'ID is a required field'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Password is a required field'],
      maxlength: [20, 'Password cannot be longer 20 characters'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    needsPasswordChange: {
      type: Boolean,
      default: true,
      required: [true, 'Needs password change is required'],
    },
    role: {
      type: String,
      enum: Roles,
      required: [true, 'Role is required'],
    },
    status: {
      type: String,
      enum: Statuses,
      default: 'in-progress',
      required: [true, 'Status is required'],
    },
    isDeleted: { type: Boolean, default: true },
  },
  { timestamps: true },
);

//* pre save middleware/hook : will work on create() and save() functions
userSchema.pre('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this; // document

  //* hashing password and saving to database
  if (user.password) {
    if (user.password !== config.default_pass) {
      user.needsPasswordChange = false;
    }

    user.password = await bcrypt.hash(
      user.password,
      Number(config.bcrypt_salt_rounds),
    );
  }

  next();
});

//* post save middleware/hook -> set '' after saving password
userSchema.post('save', function (doc, next) {
  doc.password = '';
  next();
});

export const User = model<TUser>('User', userSchema);
