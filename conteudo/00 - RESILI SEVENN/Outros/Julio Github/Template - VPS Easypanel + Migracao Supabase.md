# Template - VPS Easypanel + Migracao Supabase

> Guia completo (zero-to-hero) para configurar uma VPS com Easypanel seguindo o padrao Raya/V3 Nexus: **1 projeto unico** com **Postgres e Redis compartilhados** entre multiplos servicos. Inclui migracao de apps que estao no Supabase para Postgres self-hosted (database, auth, storage, RLS).
>
> Todos os valores entre `< >` sao placeholders. Substitua pelo seu cenario antes de executar.

---

## Sumario

1. [Pre-requisitos](#1-pre-requisitos)
2. [Provisionamento da VPS (Hostinger)](#2-provisionamento-da-vps-hostinger)
3. [Hardening do servidor](#3-hardening-do-servidor)
4. [Instalacao do Easypanel](#4-instalacao-do-easypanel)
5. [Stack compartilhada (Postgres + Redis)](#5-stack-compartilhada-postgres--redis)
6. [Adicionar um app (padrao)](#6-adicionar-um-app-padrao)
7. [Migracao Supabase para self-hosted](#7-migracao-supabase-para-self-hosted)
8. [Backup e restauracao](#8-backup-e-restauracao)
9. [Checklist de entrega + Troubleshooting](#9-checklist-de-entrega--troubleshooting)

---

## 1. Pre-requisitos

Antes de comecar, tenha em maos:

- [ ] Conta em provedor de VPS (recomendado: **Hostinger** plano KVM 2 ou superior)
- [ ] Dominio com DNS gerenciavel (recomendado: **Cloudflare**, gratis e com SSL/proxy)
- [ ] Chave SSH local gerada (`ssh-keygen -t ed25519 -C "<seu-email>"`)
- [ ] Repositorio Git (GitHub/GitLab) com Dockerfile do app que vai migrar
- [ ] Se houver migracao Supabase: acesso ao projeto Supabase de origem (Service Role Key)

> [!tip]
> Se ainda nao tem chave SSH, gere agora:
> ```bash
> ssh-keygen -t ed25519 -C "<seu-email>"
> # Aceitar caminho default ~/.ssh/id_ed25519
> # Definir passphrase forte
> ```
> A chave publica (`~/.ssh/id_ed25519.pub`) sera colada no painel da Hostinger no proximo passo.

---

## 2. Provisionamento da VPS (Hostinger)

### 2.1 Escolher o plano

Plano recomendado para rodar Postgres + Redis + 3-5 apps:

| Recurso | Minimo | Recomendado |
|---------|--------|-------------|
| CPU | 2 vCPU | 2 vCPU |
| RAM | 4 GB | 8 GB |
| Disco | 50 GB | 100 GB |
| OS | Ubuntu 24.04 LTS | Ubuntu 24.04 LTS |

### 2.2 Criar a VPS

1. Painel Hostinger > **VPS** > **Criar nova instancia**
2. Selecionar plano KVM 2 (ou equivalente)
3. **OS**: Ubuntu 24.04 LTS (sem painel pre-instalado)
4. **Localizacao**: regiao mais proxima dos usuarios finais
5. **Hostname**: `<nome-da-vps>` (ex: `meuprojeto-prod`)
6. **Chave SSH**: colar conteudo de `~/.ssh/id_ed25519.pub`
7. **Senha root**: gerar uma senha forte e guardar em gerenciador de senhas (fallback caso a chave SSH falhe)
8. Confirmar e aguardar provisionamento (2-5 minutos)

### 2.3 Anotar dados importantes

Anote em local seguro (gerenciador de senhas, NAO em texto plano):

```
IPv4: <IP_DA_VPS>
IPv6: <IPV6_DA_VPS>
Hostname: <nome-da-vps>
Senha root (fallback): <SENHA_ROOT>
SSH key path: ~/.ssh/id_ed25519
```

### 2.4 Primeiro acesso SSH

```bash
ssh -i ~/.ssh/id_ed25519 root@<IP_DA_VPS>
# Aceitar fingerprint na primeira conexao
```

Se conectar com sucesso, prossiga.

---

## 3. Hardening do servidor

Comandos para rodar logado como root via SSH.

### 3.1 Atualizar pacotes

```bash
apt update && apt upgrade -y
```

### 3.2 Configurar timezone

```bash
timedatectl set-timezone <Continent/City>
# Exemplo: timedatectl set-timezone America/Sao_Paulo
```

### 3.3 Adicionar swap (recomendado para VPS com menos de 16 GB de RAM)

```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### 3.4 SSH: desabilitar senha, exigir chave

```bash
nano /etc/ssh/sshd_config
```

Garantir as seguintes linhas (descomente se necessario):

```
PasswordAuthentication no
PermitRootLogin prohibit-password
PubkeyAuthentication yes
```

Salvar e reiniciar:

```bash
systemctl restart ssh
```

> [!warning]
> Antes de fechar a sessao SSH atual, abra uma SEGUNDA conexao em outro terminal para confirmar que o login por chave funciona. Se a nova conexao falhar, voce ainda tem a primeira aberta para corrigir.

### 3.5 Firewall UFW

```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp     # SSH
ufw allow 80/tcp     # HTTP (Let's Encrypt challenge)
ufw allow 443/tcp    # HTTPS
ufw enable
ufw status verbose
```

### 3.6 Fail2ban (protecao contra brute-force SSH)

```bash
apt install -y fail2ban
systemctl enable --now fail2ban
fail2ban-client status sshd
```

### 3.7 Hostname (opcional, se nao definiu na criacao)

```bash
hostnamectl set-hostname <nome-da-vps>
```

---

## 4. Instalacao do Easypanel

### 4.1 Instalar

```bash
curl -sSL https://get.easypanel.io | sh
```

A instalacao leva 2-5 minutos. Ao final, o output mostra a URL de acesso (ex: `http://<IP_DA_VPS>:3000`).

### 4.2 Primeiro acesso

1. Acessar `http://<IP_DA_VPS>:3000` no navegador
2. Criar usuario admin: `<email-admin>` + senha forte
3. **Salvar credenciais em gerenciador de senhas**

### 4.3 Configurar dominio do painel

Antes de continuar, mover o painel para HTTPS via subdominio.

**No Cloudflare:**
1. Adicionar dominio `<DOMINIO>` (caso ainda nao esteja)
2. Criar A record:

| Tipo | Nome | Conteudo | Proxy |
|------|------|----------|-------|
| A | `painel` | `<IP_DA_VPS>` | Proxied |

**No Easypanel:**
1. Settings > General > **Server URL**: `https://painel.<DOMINIO>`
2. Settings > General > **Lets Encrypt Email**: `<email-admin>`
3. Save
4. Clicar em **Setup HTTPS** (Easypanel emite o certificado automaticamente)
5. Acessar `https://painel.<DOMINIO>` e validar

---

## 5. Stack compartilhada (Postgres + Redis)

Esta e a decisao arquitetural central: **um unico projeto Easypanel** chamado `stack` com Postgres e Redis compartilhados, e cada app tem seu proprio database e Redis DB isolados.

### 5.1 Criar o projeto

1. Easypanel > **Projects** > **Create Project**
2. Nome: `stack`

### 5.2 Naming convention (padrao Raya)

Sempre seguir esta convencao para todos os recursos:

| Recurso | Padrao | Exemplo |
|---------|--------|---------|
| Database | `<servico>_db` | `app1_db`, `app2_db` |
| User Postgres | `<servico>_user` | `app1_user` |
| Hostname interno | `stack_<servico>` | `stack_postgres`, `stack_redis` |
| Subdominio | `<servico>.<DOMINIO>` | `app1.exemplo.com.br` |
| Volume | `stack_<servico>_<tipo>` | `stack_app1_uploads` |
| Redis DB number | sequencial por app | app1=db 0, app2=db 1, etc. |

### 5.3 Adicionar Postgres compartilhado

1. Dentro do projeto `stack` > **+ Create Service** > **Postgres**
2. Configuracao:
   - Service Name: `postgres`
   - Image: `postgres:17` (versao **fixa**, nao usar `latest`)
   - Database: `stack` (default, nao usar para apps)
   - User: `postgres`
   - Password: gerar com `openssl rand -base64 32` e salvar como `<POSTGRES_MASTER_PASSWORD>`
3. **Create**
4. Hostname interno: `stack_postgres` (nao precisa expor portas externas)

### 5.4 Adicionar Redis compartilhado

1. **+ Create Service** > **Redis**
2. Configuracao:
   - Service Name: `redis`
   - Image: `redis:7-alpine`
   - Password (AUTH): gerar com `openssl rand -base64 32` e salvar como `<REDIS_PASSWORD>`
3. **Create**
4. Hostname interno: `stack_redis`
5. URI de conexao para apps: `redis://default:<REDIS_PASSWORD>@stack_redis:6379`

### 5.5 Criar database e user para o primeiro app

Acessar o shell do Postgres (Easypanel > stack > postgres > **Console** ou via SSH):

```bash
docker exec -it stack_postgres psql -U postgres
```

Dentro do `psql`, rodar (substituindo placeholders):

```sql
-- Criar database
CREATE DATABASE <APP>_db;

-- Criar user dedicado
CREATE USER <APP>_user WITH PASSWORD '<APP_DB_PASSWORD>';

-- Permissoes
GRANT ALL PRIVILEGES ON DATABASE <APP>_db TO <APP>_user;

-- Conectar no novo database e dar permissao no schema public
\c <APP>_db
GRANT ALL ON SCHEMA public TO <APP>_user;

-- Extensions comuns (criar como superuser, depois o app pode usar)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

\q
```

> [!important]
> Cada app deve ter seu proprio database e seu proprio user. **Nunca** compartilhar credenciais entre apps - se um for comprometido, os outros ficam isolados.

A `DATABASE_URL` para o app sera:

```
postgresql://<APP>_user:<APP_DB_PASSWORD>@stack_postgres:5432/<APP>_db
```

---

## 6. Adicionar um app (padrao)

### 6.1 Criar o servico no Easypanel

1. Projeto `stack` > **+ Create Service** > **App**
2. Nome: `<APP>`
3. Source:
   - **GitHub**: conectar repositorio + branch + path para Dockerfile
   - **Docker Image**: informar `<usuario>/<imagem>:<tag>`
4. Build: Dockerfile (ja existente no repo)

### 6.2 Configurar Environment Variables

Aba **Environment** do servico, variaveis padrao:

```env
# Database (compartilhado)
DATABASE_URL=postgresql://<APP>_user:<APP_DB_PASSWORD>@stack_postgres:5432/<APP>_db

# Redis (compartilhado, isolado por DB number)
REDIS_URL=redis://default:<REDIS_PASSWORD>@stack_redis:6379/<REDIS_DB_NUMBER>

# App
NODE_ENV=production
APP_URL=https://<APP>.<DOMINIO>

# Seguranca (gerar com openssl rand)
JWT_SECRET=<gerar com: openssl rand -base64 48>
ENCRYPTION_KEY=<gerar com: openssl rand -hex 16>
```

### 6.3 Configurar dominio

**No Cloudflare**, criar A record:

| Tipo | Nome | Conteudo | Proxy |
|------|------|----------|-------|
| A | `<APP>` | `<IP_DA_VPS>` | Proxied |

**No Easypanel**:
1. Servico `<APP>` > aba **Domains** > **+ Add Domain**
2. Domain: `<APP>.<DOMINIO>`
3. Habilitar **HTTPS** (Lets Encrypt automatico)
4. Save

### 6.4 Volumes persistentes (se o app salva arquivos localmente)

Aba **Mounts** ou **Volumes**:

| Mount Path | Volume Name |
|------------|-------------|
| `/app/uploads` | `stack_<APP>_uploads` |

> [!tip]
> Para apps que precisam de storage tipo objeto (S3-like), prefira MinIO em vez de volume local. Veja secao 7.3.

### 6.5 Deploy

1. **Deploy** > acompanhar logs
2. Validar dominio responde HTTP 200: `curl -I https://<APP>.<DOMINIO>`
3. Verificar logs do app no Easypanel (sem erros de conexao com banco/redis)

---

## 7. Migracao Supabase para self-hosted

> Esta e a secao mais densa do template. Cobre os 4 componentes que o Supabase fornece e que precisam ser substituidos no self-hosted.

### Visao geral

| Componente Supabase | Substituto self-hosted | Esforco de migracao |
|---------------------|------------------------|---------------------|
| Postgres (data) | `stack_postgres` (mesma versao) | Baixo (pg_dump/restore) |
| Auth (GoTrue) | Better Auth (recomendado) ou JWT puro | Medio (migrar usuarios + reescrever client) |
| Storage | MinIO (recomendado) ou volume Docker | Medio (migrar arquivos + trocar SDK) |
| RLS automatico | RLS na aplicacao (middleware) | Medio-alto (revisar todas as policies) |
| Edge Functions | Reescrever em rotas do app ou n8n | Caso a caso |
| Realtime | Reescrever com WebSockets ou Pusher | Caso a caso |

### 7.1 Database

#### 7.1.1 Exportar do Supabase

No painel Supabase > **Database** > **Connection string** > copiar a Direct connection (nao a pooler).

```bash
# Exportar dump excluindo schemas internos do Supabase
pg_dump \
  "postgres://postgres:<SUPABASE_PASSWORD>@<SUPABASE_HOST>:5432/postgres" \
  --no-owner \
  --no-privileges \
  --exclude-schema=auth \
  --exclude-schema=storage \
  --exclude-schema=realtime \
  --exclude-schema=supabase_functions \
  --exclude-schema=graphql \
  --exclude-schema=graphql_public \
  --exclude-schema=net \
  --exclude-schema=pgsodium \
  --exclude-schema=pgsodium_masks \
  --exclude-schema=vault \
  --exclude-schema=extensions \
  --schema=public \
  --file=dump_supabase.sql
```

> [!warning]
> Nao migrar os schemas `auth`, `storage`, `realtime` - eles tem dependencias internas do Supabase (GoTrue, kong, etc.) que nao existem no Postgres puro. A migracao de auth e storage e tratada separadamente nas secoes 7.2 e 7.3.

#### 7.1.2 Restaurar no stack_postgres

Copiar o dump para a VPS e restaurar:

```bash
# No seu local
scp dump_supabase.sql root@<IP_DA_VPS>:/root/

# Na VPS (via SSH)
docker exec -i stack_postgres psql -U <APP>_user -d <APP>_db < /root/dump_supabase.sql
```

#### 7.1.3 Validar a migracao

```bash
docker exec -it stack_postgres psql -U <APP>_user -d <APP>_db
```

```sql
\dt                           -- listar tabelas (deve mostrar todas as do Supabase public)
SELECT count(*) FROM <tabela>; -- comparar com Supabase
\df                           -- listar funcoes
```

#### 7.1.4 Trocar DATABASE_URL no app

No Easypanel > servico `<APP>` > Environment, trocar:

```env
# Antes (Supabase)
DATABASE_URL=postgres://postgres.<ref>:<senha>@aws-0-<region>.pooler.supabase.com:5432/postgres

# Depois (self-hosted)
DATABASE_URL=postgresql://<APP>_user:<APP_DB_PASSWORD>@stack_postgres:5432/<APP>_db
```

Rebuild o app.

### 7.2 Auth (substituir Supabase Auth)

Recomendacao: **Better Auth** ([better-auth.com](https://www.better-auth.com)) - moderno, TypeScript-first, suporta OAuth + magic link + 2FA, integracao nativa com Postgres.

#### 7.2.1 Instalar Better Auth

```bash
npm install better-auth
# OU
pnpm add better-auth
```

#### 7.2.2 Configurar (Next.js exemplo)

`lib/auth.ts`:

```ts
import { betterAuth } from "better-auth"
import { Pool } from "pg"

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
})
```

Variaveis de ambiente:

```env
BETTER_AUTH_SECRET=<openssl rand -base64 32>
BETTER_AUTH_URL=https://<APP>.<DOMINIO>
GOOGLE_CLIENT_ID=<seu-client-id>
GOOGLE_CLIENT_SECRET=<seu-client-secret>
```

Rodar migracao do schema do Better Auth:

```bash
npx @better-auth/cli@latest migrate
```

Isso cria as tabelas `user`, `session`, `account`, `verification` no `<APP>_db`.

#### 7.2.3 Migrar usuarios do Supabase

No Supabase, exportar a tabela `auth.users` (via SQL Editor):

```sql
SELECT
  id,
  email,
  encrypted_password,
  created_at,
  updated_at,
  email_confirmed_at,
  raw_user_meta_data
FROM auth.users;
```

Exportar como CSV. Depois, script Node para inserir no Better Auth:

```ts
// scripts/migrate-supabase-users.ts
import { Pool } from "pg"
import fs from "fs"
import { parse } from "csv-parse/sync"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const csv = fs.readFileSync("./supabase_users.csv", "utf8")
const rows = parse(csv, { columns: true })

for (const row of rows) {
  // Better Auth aceita bcrypt diretamente (Supabase usa bcrypt)
  await pool.query(
    `INSERT INTO "user" (id, email, "emailVerified", "createdAt", "updatedAt", name)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (email) DO NOTHING`,
    [
      row.id,
      row.email,
      !!row.email_confirmed_at,
      row.created_at,
      row.updated_at,
      row.raw_user_meta_data?.name || null,
    ]
  )

  // Inserir credencial bcrypt na tabela account
  await pool.query(
    `INSERT INTO account ("userId", "providerId", password, "accountId")
     VALUES ($1, 'credential', $2, $3)
     ON CONFLICT DO NOTHING`,
    [row.id, row.encrypted_password, row.email]
  )
}

console.log(`Migrados ${rows.length} usuarios`)
process.exit(0)
```

> [!important]
> Supabase armazena senhas com **bcrypt** (mesmo algoritmo que Better Auth usa por padrao). Os hashes sao compativeis e os usuarios fazem login com a mesma senha. Se o seu projeto usa Argon2 ou outro algoritmo customizado, sera necessario forcar reset de senha por email.

#### 7.2.4 Reescrever uso no codigo

```ts
// ANTES (Supabase)
import { createClient } from "@supabase/supabase-js"
const supabase = createClient(url, key)
const { data, error } = await supabase.auth.signInWithPassword({ email, password })

// DEPOIS (Better Auth)
import { authClient } from "@/lib/auth-client"
const { data, error } = await authClient.signIn.email({ email, password })
```

#### 7.2.5 OAuth providers (Google/GitHub)

Atualizar `redirect_uri` no Google Cloud Console / GitHub OAuth App:

```
ANTES: https://<projeto>.supabase.co/auth/v1/callback
DEPOIS: https://<APP>.<DOMINIO>/api/auth/callback/google
```

> [!tip]
> Alternativa simples: se o app nao usa OAuth e tem poucos usuarios, considere JWT puro com `jose` ou `jsonwebtoken`. Mais codigo manual mas zero dependencias adicionais.

### 7.3 Storage (substituir Supabase Storage)

Recomendacao: **MinIO** self-hosted no projeto `stack`. E S3-compatible, entao todo o codigo que fala com Supabase Storage (S3-compatible) pode ser apontado para MinIO com poucas mudancas.

#### 7.3.1 Adicionar MinIO no Easypanel

1. Projeto `stack` > **+ Create Service** > **App**
2. Source: **Docker Image**
3. Image: `minio/minio:latest`
4. Args: `server /data --console-address ":9001"`
5. Environment:

```env
MINIO_ROOT_USER=<MINIO_ROOT_USER>
MINIO_ROOT_PASSWORD=<openssl rand -base64 32>
MINIO_BROWSER_REDIRECT_URL=https://s3-console.<DOMINIO>
```

6. Mounts:
   - `/data` -> volume `stack_minio_data`
7. Domains:
   - `s3.<DOMINIO>` -> port `9000` (API S3)
   - `s3-console.<DOMINIO>` -> port `9001` (UI admin)

DNS no Cloudflare: dois A records (`s3` e `s3-console`) apontando para `<IP_DA_VPS>`, Proxied.

#### 7.3.2 Criar buckets

Acessar `https://s3-console.<DOMINIO>`, login com root user, criar bucket equivalente ao do Supabase (ex: `avatars`, `uploads`).

Ou via MinIO Client (`mc`) na VPS:

```bash
# Instalar mc
curl https://dl.min.io/client/mc/release/linux-amd64/mc -o /usr/local/bin/mc
chmod +x /usr/local/bin/mc

# Configurar alias
mc alias set local https://s3.<DOMINIO> <MINIO_ROOT_USER> <MINIO_ROOT_PASSWORD>

# Criar bucket
mc mb local/<BUCKET_NAME>
mc anonymous set download local/<BUCKET_NAME>  # se for publico
```

#### 7.3.3 Migrar arquivos do Supabase Storage

```bash
# Configurar alias do Supabase (S3-compatible)
mc alias set supabase \
  https://<projeto>.supabase.co/storage/v1/s3 \
  <SUPABASE_ACCESS_KEY> \
  <SUPABASE_SECRET_KEY> \
  --api S3v4

# Mirror todos os arquivos
mc mirror supabase/<BUCKET> local/<BUCKET>
```

> [!tip]
> As Access Key/Secret Key do Supabase Storage estao em **Settings > API > S3 Connection** (precisa estar em plano Pro ou superior).

#### 7.3.4 Reescrever client de upload

```ts
// ANTES (Supabase)
const { data, error } = await supabase.storage
  .from("avatars")
  .upload(`${userId}/avatar.png`, file)

// DEPOIS (AWS SDK apontando para MinIO)
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

const s3 = new S3Client({
  endpoint: "https://s3.<DOMINIO>",
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY!,
    secretAccessKey: process.env.MINIO_SECRET_KEY!,
  },
  forcePathStyle: true,
})

await s3.send(new PutObjectCommand({
  Bucket: "avatars",
  Key: `${userId}/avatar.png`,
  Body: file,
  ContentType: file.type,
}))
```

Criar um **Access Key** dedicado para o app no console MinIO (NAO usar root):
1. Console MinIO > Identity > **Service Accounts** > Create
2. Salvar `access key` e `secret key` como `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` nas env vars do app

#### 7.3.5 Alternativa simples: volume Docker local

Para apps single-instance, baixo volume e sem necessidade de CDN, basta um volume Docker:

```
Mount Path: /app/uploads
Volume: stack_<APP>_uploads
```

E servir via rota do proprio app (ex: Next.js `/api/files/[...path]`). Sem replicacao, sem URLs publicas - simples e funciona.

### 7.4 RLS (Row Level Security)

> [!warning]
> Sem PostgREST + GoTrue, **o Postgres puro nao aplica RLS automaticamente via JWT**. As policies continuam existindo no banco, mas o app precisa decidir entre duas estrategias:

#### Estrategia A: RLS na aplicacao (recomendada para apps Next.js/Nest)

Mover toda logica de filtro de RLS para a camada da aplicacao. **Toda query** deve filtrar por `userId` ou `organizationId` vindo da sessao do usuario.

```ts
// Recuperar user da sessao Better Auth
const session = await auth.api.getSession({ headers: req.headers })
const userId = session?.user?.id

// Query SEMPRE filtrando
const items = await db.query.items.findMany({
  where: eq(items.userId, userId),
})
```

Com Prisma, criar um **middleware** que injeta o filtro automaticamente:

```ts
prisma.$use(async (params, next) => {
  if (params.model === "Item") {
    if (params.action === "findMany" || params.action === "findFirst") {
      params.args.where = { ...params.args.where, userId: getCurrentUserId() }
    }
  }
  return next(params)
})
```

#### Estrategia B: Manter RLS no Postgres com `set_config` por transacao

Se voce quer preservar exatamente o comportamento das policies que ja existem:

```ts
// A cada request, em uma transacao:
await db.$transaction(async (tx) => {
  await tx.$executeRaw`SELECT set_config('request.jwt.claims', ${JSON.stringify({sub: userId})}, true)`
  return tx.items.findMany()
})
```

E ajustar as policies que usavam `auth.uid()` para usar `current_setting('request.jwt.claims', true)::json->>'sub'`.

#### Mapeamento de padroes

| Supabase | Self-hosted (Estrategia A) |
|----------|----------------------------|
| `auth.uid()` em policy | `WHERE "userId" = $sessionUser` no query do app |
| `auth.role()` | Coluna `role` na tabela `user` + check no middleware |
| `auth.jwt()->>'org_id'` | Sessao do Better Auth + filtro no query |
| RLS automatico | Defesa em profundidade (RLS no banco) + filtro obrigatorio no app |

> [!important]
> Mesmo com Estrategia A, **mantenha as policies RLS no banco** como ultima linha de defesa. Se o desenvolvedor esquecer um filtro no app, o banco ainda recusa a query (desde que a conexao use um user com `BYPASSRLS` desativado).

---

## 8. Backup e restauracao

### 8.1 Script de backup

Criar `/root/scripts/backup.sh` na VPS:

```bash
#!/bin/bash
set -e

DATE=$(date +%Y-%m-%d)
BACKUP_DIR="/root/backups/$DATE"
mkdir -p "$BACKUP_DIR"

# Lista de databases (ajustar conforme apps)
DATABASES=(<app1>_db <app2>_db <app3>_db)

# Dump de cada database
for DB in "${DATABASES[@]}"; do
  docker exec stack_postgres pg_dump -U postgres "$DB" | gzip > "$BACKUP_DIR/${DB}.sql.gz"
done

# Tar dos volumes persistentes (ajustar conforme servicos)
VOLUMES=(stack_<app1>_uploads stack_minio_data)

for VOL in "${VOLUMES[@]}"; do
  docker run --rm \
    -v "$VOL:/data" \
    -v "$BACKUP_DIR:/backup" \
    alpine tar czf "/backup/${VOL}.tar.gz" -C /data .
done

# Retencao: 30 dias
find /root/backups -mindepth 1 -maxdepth 1 -type d -mtime +30 -exec rm -rf {} \;

echo "Backup concluido em $BACKUP_DIR"
```

```bash
chmod +x /root/scripts/backup.sh
```

### 8.2 Cron diario as 3h

```bash
crontab -e
```

Adicionar:

```
0 3 * * * /root/scripts/backup.sh >> /var/log/backup.log 2>&1
```

### 8.3 Testar manualmente

```bash
/root/scripts/backup.sh
ls -lah /root/backups/
```

### 8.4 Restaurar um database

```bash
# Subir o dump
zcat /root/backups/<DATA>/<APP>_db.sql.gz | \
  docker exec -i stack_postgres psql -U postgres -d <APP>_db
```

### 8.5 Restaurar um volume

```bash
docker run --rm \
  -v stack_<APP>_uploads:/data \
  -v /root/backups/<DATA>:/backup \
  alpine sh -c "rm -rf /data/* && tar xzf /backup/stack_<APP>_uploads.tar.gz -C /data"
```

> [!important]
> **Testar o restore mensalmente** em uma VPS de staging. Backup que nunca foi testado e backup que nao funciona.

### 8.6 Off-site backup (recomendado)

Sincronizar `/root/backups/` para um bucket S3 externo (Backblaze B2, Wasabi, R2) via `rclone` apos cada execucao:

```bash
# Adicionar ao final do backup.sh
rclone sync /root/backups/ <remote>:<bucket>/<vps-name>/ --max-age 30d
```

---

## 9. Checklist de entrega + Troubleshooting

### Checklist final

Antes de considerar a entrega concluida, validar todos os itens:

#### Servidor
- [ ] VPS provisionada com OS Ubuntu 24.04 LTS
- [ ] SSH key-only funcionando (senha desabilitada)
- [ ] UFW ativo (apenas 22/80/443 inbound)
- [ ] Fail2ban ativo
- [ ] Swap configurada
- [ ] Timezone correto

#### Easypanel
- [ ] Painel acessivel em `https://painel.<DOMINIO>` com SSL valido
- [ ] Usuario admin criado e credenciais salvas

#### Stack
- [ ] Projeto `stack` criado
- [ ] Postgres versao fixa (`postgres:17`) com password forte
- [ ] Redis 7-alpine com AUTH ativado
- [ ] Pelo menos 1 database criado seguindo naming convention

#### App migrado
- [ ] Database migrado (pg_dump/restore validados com `\dt` e `count(*)`)
- [ ] Auth substituido (Better Auth ou equivalente, com migracao de usuarios)
- [ ] Storage substituido (MinIO ou volume Docker)
- [ ] RLS revisado (policies removidas/adaptadas, filtros no app)
- [ ] Dominio responde HTTP 200 com SSL valido
- [ ] Login com usuario migrado funciona
- [ ] Upload de arquivo funciona
- [ ] OAuth (Google/GitHub) funciona com novo `redirect_uri`

#### Operacao
- [ ] Script de backup criado em `/root/scripts/backup.sh`
- [ ] Cron de backup ativo (`0 3 * * *`)
- [ ] Backup manual testado uma vez (valida que dumps geram sem erro)
- [ ] Off-site backup configurado (recomendado)

### Troubleshooting

#### App retorna 502 Bad Gateway

```
Causa: Container crashou no startup
Verificar:
1. Logs do servico no Easypanel
2. DATABASE_URL aponta para stack_postgres (nao para Supabase)
3. ENCRYPTION_KEY tem o tamanho correto (16 bytes hex = 32 chars)
4. Postgres esta com status verde no Easypanel
```

#### Erro `function auth.uid() does not exist` apos migracao

```
Causa: Schema auth do Supabase nao foi migrado (correto - nao deve ser)
Solucao: Reescrever queries que usavam auth.uid() para usar a sessao do app
        OU adaptar policies para usar current_setting('request.jwt.claims')
```

#### Storage retorna 403 Forbidden

```
Causa: Bucket policy do MinIO nao configurada
Verificar:
1. Bucket existe (mc ls local/)
2. Access Key/Secret usados pelo app tem permissao no bucket
3. Para arquivos publicos: mc anonymous set download local/<bucket>
```

#### Login OAuth falha com `redirect_uri_mismatch`

```
Causa: Google/GitHub OAuth ainda aponta para Supabase
Verificar:
1. Google Cloud Console > Credentials > OAuth Client > Authorized redirect URIs
2. Adicionar: https://<APP>.<DOMINIO>/api/auth/callback/google
3. Aguardar 1-2 min para propagar
```

#### Senhas migradas nao funcionam

```
Causa: Algoritmo de hash diferente do bcrypt (raro - Supabase usa bcrypt)
Verificar:
1. Conferir hash na tabela account: deve comecar com $2a$ ou $2b$
2. Se for hash diferente, forcar reset de senha por email para todos
```

#### Postgres "out of shared memory" durante restore grande

```
Causa: shared_buffers muito baixo para o volume restaurado
Solucao: Editar postgres.conf via Easypanel:
  shared_buffers = 1GB
  work_mem = 16MB
Reiniciar o servico postgres.
```

#### Backup script falha com "permission denied"

```
Causa: Volume Docker nao acessivel pelo container alpine
Solucao: Rodar como root (cron do root) ou ajustar permissoes:
  chmod -R a+r /var/lib/docker/volumes/<VOLUME>/_data
```

---

## Referencias internas (vault Raya)

- [[VPS Overview]] - estado real da arquitetura Raya/V3 (KVM 2 Hostinger)
- [[PostgreSQL Compartilhado]] - detalhes operacionais do Postgres compartilhado
- [[Redis Compartilhado]] - URI, AUTH, isolamento por DB
- [[Adicionar Novo Servico]] - checklist resumido para novos apps
- [[Backup e Restauracao]] - script e procedimentos completos
- [[Mapeamento de Dominios]] - convencao Cloudflare e DNS
- [[Acessos]] - cofre de credenciais (sensivel - NAO compartilhar com parceiro externo)

---

## Versao deste template

- v1.0 - 2026-04-25 - Versao inicial baseada no padrao Raya/V3 Nexus consolidado em 2026-04-08 ([[2026-04-08 Consolidar VPS em 1 projeto Easypanel]])
