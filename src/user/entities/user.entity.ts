export class User {
  id: string;
  username: string;
  password: string;
  profile: Profile;
}

export class Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
}
