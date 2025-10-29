import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';

enum Env {
    Development = 'development',
    Test = 'test',
    Production = 'production',
}

export class EnvironmentVariables {
    @IsEnum(Env)
    declare public NODE_ENV: Env;

    @IsNumber({}, { message: 'PORT must be a numeric value' })
    declare public PORT: number;

    @IsString()
    declare public CORS_ORIGIN: string;
}

export function validate(config: Record<string, unknown>) {
    const validated = plainToInstance(EnvironmentVariables, config, {
        enableImplicitConversion: true,
    });

    const errors = validateSync(validated, { skipMissingProperties: false });

    if (errors.length > 0) {
        throw new Error(
            errors
                .map((err) =>
                    err.constraints ? `${err.property}: ${Object.values(err.constraints).join(', ')}` : `${err.property}: invalid`,
                )
                .join('; '),
        );
    }

    return validated;
}
