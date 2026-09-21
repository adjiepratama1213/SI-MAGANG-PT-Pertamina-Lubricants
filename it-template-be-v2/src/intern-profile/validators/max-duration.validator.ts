import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsMaxDurationMonths(
  property: string,
  maxMonths: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isMaxDurationMonths',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property, maxMonths],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName, maxMonthsConstraint] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];

          if (!value || !relatedValue) {
            return true; // if dates are not provided, skip this validation
          }

          const startDate = new Date(relatedValue);
          const endDate = new Date(value);

          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return false;
          }

          // Ensure it doesn't exceed 6 months
          const tempDate = new Date(startDate);
          tempDate.setMonth(tempDate.getMonth() + maxMonthsConstraint);
          
          return endDate <= tempDate;
        },
        defaultMessage(args: ValidationArguments) {
          const [, maxMonthsConstraint] = args.constraints;
          return `Durasi magang tidak boleh lebih dari ${maxMonthsConstraint} bulan (dihitung dari tanggal mulai).`;
        }
      },
    });
  };
}
