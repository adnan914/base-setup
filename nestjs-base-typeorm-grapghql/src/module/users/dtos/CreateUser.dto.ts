export class CreateUserDto {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  photo_url?: string;
  bio?: string;
  role?: string;
}
