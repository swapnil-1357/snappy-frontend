import { z } from 'zod'

export const nameValidation = z
    .string()
    .min(3, 'Name must be atleast 3 characters')

export const usernameValidation = z
    .string()
    .min(6, 'Username must be atleast 6 character')
    .max(14, 'Username must be not more than 14 characters')
    .regex(/^[a-zA-Z0-9]+$/, 'Username must not contain special character')
    .regex(/^\S*$/, 'Username must not contain white spaces')

export const emailValidation = z
    .string()
    .email()

export const passwordValidation = z
    .string()
    .min(6, 'Password must be atleast 6 characters')
    .max(16, 'Password must be no more than 16 characters')
    .regex(/^\S*$/, 'Username must not contain white spaces')

export const signUpSchema = z.object({
    name: nameValidation,
    username: usernameValidation,
    email: emailValidation,
    password: passwordValidation
})