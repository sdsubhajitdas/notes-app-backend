import { Request } from "express";

export type User = {
  id?: number;
  email: string;
  password?: string;
};