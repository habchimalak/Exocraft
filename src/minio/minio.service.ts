/**
 * MinioService — gestion du stockage objet S3-compatible
 * Utilise le SDK AWS S3 pointé vers MinIO local
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Readable } from 'stream'
import * as path from 'path'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name)
  private readonly s3: S3Client
  private readonly bucket: string

  constructor(private readonly configService: ConfigService) {
    const endpoint  = configService.get('MINIO_ENDPOINT', 'http://localhost:9000')
    const accessKey = configService.get('MINIO_ACCESS_KEY', 'exocraft_admin')
    const secretKey = configService.get('MINIO_SECRET_KEY', 'exocraft_minio_2024')
    this.bucket     = configService.get('MINIO_BUCKET', 'exocraft')

    this.s3 = new S3Client({
      endpoint,
      region: 'us-east-1', // MinIO ignore la région mais S3 SDK la requiert
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
      forcePathStyle: true, // Obligatoire pour MinIO
    })
  }

  async onModuleInit() {
    await this.ensureBucketExists()
  }

  // ── S'assurer que le bucket existe ──────────────────────────────────────
  async ensureBucketExists() {
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }))
      this.logger.log(`✅ Bucket "${this.bucket}" existe`)
    } catch {
      try {
        await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }))
        this.logger.log(`✅ Bucket "${this.bucket}" créé`)
      } catch (err) {
        this.logger.warn(`⚠️ MinIO non disponible — mode dégradé: ${(err as Error).message}`)
      }
    }
  }

  // ── Upload fichier ────────────────────────────────────────────────────────
  async uploadFile(
    file: Express.Multer.File,
    folder: 'documents' | 'archives' | 'avatars',
  ): Promise<{ key: string; url: string; size: number }> {
    const ext      = path.extname(file.originalname)
    const key      = `${folder}/${uuidv4()}${ext}`
    const mimeType = file.mimetype

    await this.s3.send(
      new PutObjectCommand({
        Bucket:      this.bucket,
        Key:         key,
        Body:        file.buffer,
        ContentType: mimeType,
        Metadata: {
          originalName: Buffer.from(file.originalname).toString('base64'),
        },
      }),
    )

    const url = `${this.configService.get('MINIO_ENDPOINT', 'http://localhost:9000')}/${this.bucket}/${key}`

    return { key, url, size: file.size }
  }

  // ── Générer une URL signée (accès temporaire sécurisé) ───────────────────
  async getSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key })
    return getSignedUrl(this.s3, command, { expiresIn: expiresInSeconds })
  }

  // ── URL publique permanente ───────────────────────────────────────────────
  getPublicUrl(key: string): string {
    return `${this.configService.get('MINIO_ENDPOINT', 'http://localhost:9000')}/${this.bucket}/${key}`
  }

  // ── Supprimer fichier ─────────────────────────────────────────────────────
  async deleteFile(key: string): Promise<void> {
    try {
      await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }))
    } catch (err) {
      this.logger.warn(`Impossible de supprimer ${key}: ${(err as Error).message}`)
    }
  }

  // ── Stream pour téléchargement ────────────────────────────────────────────
  async getFileStream(key: string): Promise<{ stream: Readable; contentType: string; originalName: string }> {
    const response = await this.s3.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
    )

    const originalNameB64 = response.Metadata?.originalname ?? ''
    const originalName    = originalNameB64
      ? Buffer.from(originalNameB64, 'base64').toString('utf-8')
      : path.basename(key)

    return {
      stream:       response.Body as Readable,
      contentType:  response.ContentType ?? 'application/octet-stream',
      originalName,
    }
  }

  // ── Format taille fichier ─────────────────────────────────────────────────
  static formatSize(bytes: number): string {
    if (bytes < 1024)           return `${bytes} B`
    if (bytes < 1024 * 1024)   return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
}
