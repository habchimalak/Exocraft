# ============================================================
# ExoCraft Setup Script — Lance MySQL + MinIO + migre la DB
# Exécuter dans le dossier exocraft-backend :
#   .\setup.ps1
# ============================================================

Write-Host "🚀 ExoCraft Setup" -ForegroundColor Cyan
Write-Host ""

# 1. Démarrer les containers Docker
Write-Host "📦 Démarrage MySQL + MinIO..." -ForegroundColor Yellow
docker-compose up -d

# 2. Attendre que MySQL soit prêt
Write-Host "⏳ Attente MySQL (30 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# 3. Générer le client Prisma
Write-Host "🔧 Génération client Prisma..." -ForegroundColor Yellow
npx prisma generate

# 4. Migrer la base de données
Write-Host "🗄️  Migration base de données..." -ForegroundColor Yellow
npx prisma migrate dev --name init

# 5. Seed des données initiales
Write-Host "🌱 Insertion données initiales..." -ForegroundColor Yellow
npx tsx src/prisma/seed.ts

# 6. Build NestJS
Write-Host "🔨 Build backend..." -ForegroundColor Yellow
npx nest build

Write-Host ""
Write-Host "✅ Setup terminé !" -ForegroundColor Green
Write-Host ""
Write-Host "Démarrer le backend : node dist/main.js" -ForegroundColor Cyan
Write-Host "Console MinIO       : http://localhost:9001" -ForegroundColor Cyan
Write-Host "  Login : exocraft_admin / exocraft_minio_2024" -ForegroundColor Gray
