import { IsEnum, IsString, IsOptional } from 'class-validator';

export enum DocumentType {
  BUSINESS_LICENSE = 'business_license',
  HEALTH_PERMIT = 'health_permit',
  OWNER_ID = 'owner_id',
  INSURANCE = 'insurance',
  TAX_CERTIFICATE = 'tax_certificate',
  BUSINESS_LOGO = 'business_logo',
  COVER_PHOTO = 'cover_photo',
  DRIVERS_LICENSE = 'drivers_license',
  VEHICLE_REGISTRATION = 'vehicle_registration',
  NATIONAL_ID = 'national_id',
  PROFILE_PHOTO = 'profile_photo',
  GUARANTOR_FORM = 'guarantor_form',
}

export class UploadDocumentDto {
  @IsEnum(DocumentType)
  type: DocumentType;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  expiresAt?: string;
}
