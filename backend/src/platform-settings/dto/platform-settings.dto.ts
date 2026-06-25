import { IsString, IsBoolean, IsOptional, IsObject } from 'class-validator';

export class UpdateSystemConfigDto {
  @IsString()
  key: string;

  @IsString()
  value: string;

  @IsBoolean()
  isEncrypted: boolean;
}

export class UpdateWhiteLabelDto {
  @IsString()
  @IsOptional()
  domain?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  primaryColor?: string;

  @IsString()
  @IsOptional()
  secondaryColor?: string;
}

export class UpdateCMSPageDto {
  @IsString()
  pageName: string;

  @IsObject()
  content: any;
}
