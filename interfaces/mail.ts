export interface obj {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  attachments: string;
  ratelimit?: number;
  sendSeperate?: number;
}
