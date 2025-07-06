import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { isValidObjectId } from 'mongoose';

export function IsObjectId(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isObjectId',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          return isValidObjectId(value);
        },
        defaultMessage() {
          return 'Invalid taskId format: must be a 24-character hex string (MongoDB ObjectId)';
        },
      },
    });
  };
}
