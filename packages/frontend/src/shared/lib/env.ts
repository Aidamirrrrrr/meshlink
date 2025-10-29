import { z } from 'zod';

const envSchema = z.object({
    VITE_SIGNALING_URL: z.string().url('VITE_SIGNALING_URL must be a valid URL'),
    VITE_API_BASE_URL: z.string().url('VITE_API_BASE_URL must be a valid URL'),
});

function validateEnv() {
    try {
        return envSchema.parse({
            VITE_SIGNALING_URL: import.meta.env.VITE_SIGNALING_URL,
            VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessage = error.issues.map((issue: z.ZodIssue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');

            throw new Error(`Environment validation failed:\n${errorMessage}\n\nPlease check your .env file.`);
        }
        throw error;
    }
}

export const env = validateEnv();

export type Env = z.infer<typeof envSchema>;
