import { z } from "zod";

export const ContactSchema = z.object({
  fullname: z
    .string()
    .min(1, { message: "Full name is required" })
    .max(50, { message: "Full name is too long" }),
  email: z.email({ message: "Please enter a valid email address" }),
  phone: z
    .string()
    .min(10, { message: "Phone number is required" })
    .max(15, { message: "Phone number is too long" }),
  feedback: z
    .string()
    .min(1, { message: "Message is required" })
    .max(500, { message: "Message is too long" }),
});
