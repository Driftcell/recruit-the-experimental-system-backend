import { User } from 'src/user/entities/user.entity';

export class Chat {
  id: string;
  name: string;
  user: User;
  messages: Message[];
}

export class Message {
  id: string;
  content: string;
}
