export type JWTUser = {
  id: string;
  nick: string;
  email: string;
  google_id: string;
  isScrum: boolean;
};

export type Token = {
  user: JWTUser;
};