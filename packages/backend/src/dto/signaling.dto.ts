import { IsBoolean, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class JoinRoomDto {
    @IsString()
    @IsNotEmpty()
    declare roomId: string;
}

export class WebRTCDataDto {
    @IsOptional()
    @IsString()
    type?: string;

    @IsOptional()
    @IsString()
    sdp?: string;

    @IsOptional()
    @IsString()
    candidate?: string | null;

    @IsOptional()
    sdpMid?: string | null;

    @IsOptional()
    @IsNumber()
    sdpMLineIndex?: number | null;

    @IsOptional()
    usernameFragment?: string;
}

export class SignalDto {
    @IsString()
    @IsNotEmpty()
    declare roomId: string;

    @IsString()
    @IsOptional()
    to?: string;

    @IsObject()
    declare data: Record<string, unknown>;
}

export class MediaStateDto {
    @IsString()
    @IsNotEmpty()
    declare roomId: string;

    @IsBoolean()
    declare camOn: boolean;

    @IsBoolean()
    declare micOn: boolean;

    @IsBoolean()
    declare screenOn: boolean;
}

export class LeaveRoomDto {
    @IsString()
    @IsNotEmpty()
    declare roomId: string;
}
