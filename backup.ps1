# Script de backup mensal do Desktop/pasta principal para o GitHub.
# Uso: abrir PowerShell nesta pasta e rodar: .\backup.ps1

$ErrorActionPreference = "Stop"

$RepoDir = $PSScriptRoot
$OrigemPrefixo = "00 - BACKUP"

# Repos de cliente que já têm backup próprio (commit/push direto no projeto) — não duplicar aqui.
# Robocopy /XD só exclui de forma confiável pelo nome da pasta (não pelo caminho completo com espaços),
# então usamos só o nome final — são únicos o suficiente para não colidir com outra coisa.
$PastasComRepoProprio = @(
    "website-dr-arlan",
    "website-dra-gabrielle",
    "site-santa-podologa-backup",
    "website-rvf-odontologia"
)

# 1. Achar a pasta de origem
$origem = Get-ChildItem "C:\" -Directory -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -like "$OrigemPrefixo*" } |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

if (-not $origem) {
    Write-Host "ERRO: nenhuma pasta 'C:\$OrigemPrefixo*' encontrada. Renomeie a pasta do backup para esse padrão (ex: '$OrigemPrefixo $(Get-Date -Format 'yyyy-MM')')." -ForegroundColor Red
    exit 1
}

Write-Host "Pasta de origem: $($origem.FullName)" -ForegroundColor Cyan

# 2. Copiar para o repo, respeitando exclusões
$destino = Join-Path $RepoDir "conteudo"
if (-not (Test-Path $destino)) { New-Item -ItemType Directory -Path $destino | Out-Null }

$excludeArgs = @("/XD", "node_modules", ".git", "wp-restore", "wp-data") + $PastasComRepoProprio

Write-Host "Copiando arquivos (isso pode levar alguns minutos)..." -ForegroundColor Cyan
robocopy $origem.FullName $destino /MIR /XF "*.mp4" "*.mov" "*.avi" "*.mkv" ".env" ".env.*" @excludeArgs /NFL /NDL /NJH /R:1 /W:1 | Out-Null

# GitHub recusa arquivos acima de 100MB — remove do destino (o original na pasta de origem continua intacto)
Write-Host "`nVerificando arquivos acima de 95MB (limite do GitHub é 100MB)..." -ForegroundColor Cyan
$grandes = Get-ChildItem $destino -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.Length -gt 95MB }
if ($grandes) {
    Write-Host "Removidos $($grandes.Count) arquivo(s) grande(s) demais para o GitHub (envie ao Drive manualmente):" -ForegroundColor Yellow
    $grandes | ForEach-Object {
        Write-Host "  - $($_.FullName.Replace($destino, 'conteudo')) ($([math]::Round($_.Length/1MB,1)) MB)" -ForegroundColor Yellow
        Remove-Item $_.FullName -Force
    }
}

# 3. Listar vídeos que ainda não parecem estar em lugar nenhum (checagem por nome no Drive)
Write-Host "`nVerificando vídeos (.mp4) que talvez ainda não estejam no Drive..." -ForegroundColor Cyan
$videos = Get-ChildItem $origem.FullName -Recurse -File -Include *.mp4, *.mov -ErrorAction SilentlyContinue |
    Where-Object {
        $rel = $_.FullName
        $emRepoProprio = $false
        foreach ($p in $PastasComRepoProprio) {
            if ($rel -like "*\$p\*") { $emRepoProprio = $true }
        }
        -not $emRepoProprio
    }

if ($videos) {
    Write-Host "Encontrados $($videos.Count) vídeos. Peça para o Claude checar quais já estão no Drive (comparação por nome)." -ForegroundColor Yellow
    $videos | Select-Object FullName, @{N='MB';E={[math]::Round($_.Length/1MB,1)}} |
        Export-Csv (Join-Path $RepoDir "videos-pendentes.csv") -NoTypeInformation -Encoding UTF8
    Write-Host "Lista salva em videos-pendentes.csv" -ForegroundColor Yellow
} else {
    Write-Host "Nenhum vídeo encontrado fora dos repos próprios." -ForegroundColor Green
}

# 4. Commit e push
Set-Location $RepoDir
$dataBackup = Get-Date -Format "yyyy-MM-dd"
git add -A
$temMudanca = git status --porcelain
if ($temMudanca) {
    git commit -m "Backup $dataBackup"
    Write-Host "`nCommit criado. Rode 'git push' para enviar ao GitHub (ou peça para o Claude revisar antes)." -ForegroundColor Cyan
} else {
    Write-Host "`nNenhuma mudança desde o último backup." -ForegroundColor Green
}

# 5. Registrar data do último backup para o lembrete mensal
$dataBackup | Out-File (Join-Path $RepoDir "ultimo-backup.txt") -Encoding UTF8 -NoNewline
