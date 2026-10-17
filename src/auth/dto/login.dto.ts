import { IsEmail, IsString, IsNotEmpty, IsIn } from 'class-validator'

export class LoginDto {
  @IsEmail()
  email!: string

  @IsString()
  @IsNotEmpty()
  motDePasse!: string

  @IsIn(['licence', 'cycle_ing'])
  etablissementType!: string
}
