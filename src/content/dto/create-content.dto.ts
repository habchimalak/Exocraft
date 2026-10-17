import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateContentDto {
  @IsString()
  @IsNotEmpty({ message: 'Le titre est obligatoire' })
  titre: string;

  @IsEnum(['cours', 'resume', 'serie', 'examen'], { message: 'Type invalide : cours, resume, serie ou examen' })
  type: string;

  @IsString()
  @IsNotEmpty({ message: 'La mati├¿re est obligatoire' })
  matiere: string;

  @IsString()
  @IsNotEmpty({ message: 'Le th├¿me est obligatoire' })
  theme: string;

  @IsString()
  @IsNotEmpty({ message: 'Le contenu est obligatoire' })
  contenu: string;

  // auteurId est inject├⌐ depuis le token JWT, pas envoy├⌐ par le client
  auteurId: number;

  @IsEnum(['prive', 'public'])
  @IsOptional()
  visibilite?: 'prive' | 'public';
}
