export interface Chat {
  room: string;
  message?: { data: { text: string } };
  sender: { firstName: string; account: string };
  body?: { status?: string };
}

export interface Tech {
  text: string;
  aid: number;
  pid: number;
  _id: string;
  name: string;
  tids: string[];
}

export interface Join {
  room: string;
  key: string;
  value: string;
}

export interface Login {
  id: string;
  user: {
    settings?: {};
    cellphone?: string;
    _id: string;
    account: string;
    status: number;
    permissions: number;
    email: string;
    persons: {
      firstName: string;
      lastName: string;
    };
  };
}
