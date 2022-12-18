export type TokenUser = {
  id: string;
  nick: string;
  email: string;
  google_id: string;
  isScrum: boolean;
};

export type Token = {
  user: TokenUser;
};

export type GoogleUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
};
