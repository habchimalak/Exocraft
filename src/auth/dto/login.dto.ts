import { IsEmail, IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator'

export class LoginDto {
  @IsEmail()
  email!: string

  @IsString()
  @IsNotEmpty()
  motDePasse!: string

  // Optionnel — Solution A : le type d'établissement est lu depuis le compte
  @IsOptional()
  @IsIn(['licence', 'cycle_ing'])
  etablissementType?: string
}
