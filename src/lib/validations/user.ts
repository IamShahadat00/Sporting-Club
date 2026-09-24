import { z } from "zod"

export const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().optional(), // optional because updates might not change it
  role: z.enum(["ADMIN", "EDITOR", "VIEWER"])
})