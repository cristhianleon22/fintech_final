import { z } from 'zod';

export const RegisterUserSchema = z.object({
    email: z.string().email('El formato del correo electrónico no es válido.'),
    password: z
        .string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres.')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/,
            'La contraseña debe incluir al menos una mayúscula, una minúscula, un número y un carácter especial.'
        ),
    fullName: z
        .string()
        .min(3, 'El nombre debe tener al menos 3 caracteres.')
        .regex(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s']+$/, 'El nombre solo puede contener letras y espacios.'),
});

export const LoginSchema = z.object({
    email: z.string().email('El formato del correo electrónico no es válido.'),
    password: z.string().min(1, 'La contraseña es obligatoria.'),
});

export type RegisterUserDTO = z.infer<typeof RegisterUserSchema>;
export type LoginDTO = z.infer<typeof LoginSchema>;

