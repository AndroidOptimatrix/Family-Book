export interface Notification {
  id: string;
  result: string;
  msg: string;
  deathnote: string;
  title: string;
  description: string;
  photo: string;
  date: string;
  total_reaction: string;
  user_reacted: string;
}

export interface NotificationResponse {
  DATA: Notification[];
}

