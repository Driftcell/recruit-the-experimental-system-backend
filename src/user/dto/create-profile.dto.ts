export class CreateProfileDto {
  name: string;
  email: string;
  phone: string;
  age: number;
  extra: Record<string, any>;
}
