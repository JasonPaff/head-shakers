import { isValid } from 'date-fns';
import { z } from 'zod';

export const decimalTwoDigitRegex = /^\d+(\.\d{1,2})?$/;
export const numberFourDigitRegex = /\d{4}/;
export const UUIDRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface ZodDateStringOptions {
  fieldName: string;
  formats?: Array<string>;
  isNullable?: boolean;
}

interface ZodUtilFieldName {
  fieldName: string;
  isRequired?: boolean;
}

export const zodDateString = ({ fieldName, isNullable = false }: ZodDateStringOptions) => {
  const baseSchema = z.string().trim();
  const invalidMessage = `${fieldName} must be a valid date`;
  const requiredMessage = `${fieldName} is required`;

  if (isNullable) {
    return baseSchema
      .refine((val) => !val || isValid(new Date(val)), invalidMessage)
      .transform((val): Date | null => (val ? new Date(val) : null));
  }

  // required date
  return baseSchema
    .min(1, requiredMessage)
    .refine((val) => isValid(new Date(val)), invalidMessage)
    .transform((val): Date => new Date(val));
};

type ZodDecimalOptions = ZodUtilFieldName;

export const zodDecimal = ({ fieldName, isRequired }: ZodDecimalOptions) => {
  const baseSchema = z.string().trim();
  const requiredMessage = `${fieldName} is required`;
  const invalidMessage = `${fieldName} must be a valid number`;

  if (isRequired) {
    return baseSchema
      .min(1, requiredMessage)
      .refine((val) => decimalTwoDigitRegex.test(val), invalidMessage)
      .transform((val) => parseFloat(val));
  }

  return z
    .string()
    .trim()
    .refine((val) => !val || decimalTwoDigitRegex.test(val), 'Must be a valid number')
    .transform((val) => (val ? parseFloat(val) : null));
};

interface zodMinMaxStringOptions extends Omit<ZodUtilFieldName, 'isRequired'> {
  maxLength: number;
  minLength: number;
}

export const zodMinMaxString = ({ fieldName, maxLength, minLength }: zodMinMaxStringOptions) => {
  const baseSchema = z.string().trim();

  const requiredMessage = `${fieldName} is required`;
  const maxLengthMessage = `${fieldName} must be ${maxLength} characters or less`;
  const minLengthMessage = `${fieldName} must be at least ${minLength} characters`;

  return baseSchema
    .min(minLength, minLength === 1 ? requiredMessage : minLengthMessage)
    .max(maxLength, maxLengthMessage);
};

interface zodMinStringOptions extends Omit<ZodUtilFieldName, 'isRequired'> {
  minLength: number;
}

export const zodMinString = ({ fieldName, minLength }: zodMinStringOptions) => {
  const baseSchema = z.string().trim();

  const requiredMessage = `${fieldName} is required`;
  const minLengthMessage = `${fieldName} must be at least ${minLength} characters`;

  return baseSchema.min(minLength, minLength === 1 ? requiredMessage : minLengthMessage);
};

interface zodMaxStringOptions extends ZodUtilFieldName {
  maxLength: number;
}

export const zodMaxString = ({ fieldName, isRequired, maxLength }: zodMaxStringOptions) => {
  const baseSchema = z.string().trim();

  const requiredMessage = `${fieldName} is required`;
  const maxLengthMessage = `${fieldName} must be ${maxLength} characters or less`;

  if (isRequired) {
    return baseSchema.min(1, requiredMessage).max(maxLength, maxLengthMessage);
  }

  return baseSchema.max(maxLength, maxLengthMessage).transform((val) => (val ? val : null));
};

export const zodYear = ({ fieldName, isRequired }: ZodUtilFieldName) => {
  const baseSchema = z.string().trim();
  const requiredMessage = `${fieldName} is required`;
  const invalidMessage = `${fieldName} must be a valid 4 digit year`;
  const rangeMessage = `${fieldName} must be between 1900 and ${new Date().getFullYear() + 1}`;

  if (isRequired) {
    return baseSchema
      .min(1, requiredMessage)
      .refine((val) => numberFourDigitRegex.test(val), invalidMessage)
      .transform((val) => parseFloat(val))
      .refine((val) => val >= 1900 && val <= new Date().getFullYear() + 1, rangeMessage);
  }

  return baseSchema
    .refine((val) => !val || numberFourDigitRegex.test(val), invalidMessage)
    .transform((val) => (val ? parseFloat(val) : null))
    .refine((val) => !val || (val && val >= 1900 && val <= new Date().getFullYear() + 1), rangeMessage);
};

export const zodNullableUUID = (fieldName: string) => {
  const invalidMessage = `${fieldName} must be a valid UUID`;

  return z
    .string()
    .refine((val) => !val || UUIDRegex.test(val), invalidMessage)
    .transform((val) => (val ? val : null));
};
