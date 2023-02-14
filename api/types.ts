import {Request} from "express";

export type UserRequest = Request & { locals: Date };