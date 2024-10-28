import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    // _id?: string;
    number?: string;
    role?: string;
  }
  interface Session {
    user: {
      id?: string;
      number?: string;
      role?: string;
    } & DefaultSession["user"];
  }
}

// declare module "next-auth/jwt" {
//   interface JWT {
//     id?: string;
//   }
// }