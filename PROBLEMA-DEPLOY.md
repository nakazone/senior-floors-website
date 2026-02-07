# 🔍 Problema Identificado: Deploy Enviando Arquivos Errados

## ❌ Problema Encontrado

Os scripts de deploy (`deploy-ftp.sh` e `deploy-ftp.py`) estão enviando a **pasta `php/`** (versão antiga do site em PHP) ao invés dos **arquivos Next.js** que estão no Git.

### Evidências:

1. **Script `deploy-ftp.sh` linha 14:**
   ```bash
   zip -r deploy-package.zip php/ -x "*.git*" "*.DS_Store" "php/data/*.txt"
   ```
   → Está criando ZIP apenas com a pasta `php/`

2. **Script `deploy-ftp.py` linha 104:**
   ```python
   upload_directory(ftp, 'php', '.')
   ```
   → Está enviando apenas a pasta `php/`

3. **Arquivo `deploy-package.zip` atual:**
   - Contém apenas arquivos PHP (`.php`, `includes/`, `api/`, etc.)
   - **NÃO contém** arquivos Next.js (`.tsx`, `.ts`, `app/`, `components/`, etc.)

4. **No Git há:**
   - Arquivos Next.js: `app/`, `components/`, `lib/`, `package.json`, etc.
   - Arquivos TypeScript/React: `.tsx`, `.ts`
   - **NÃO são enviados** pelos scripts atuais

## ✅ Solução

Para fazer deploy do **Next.js** (que está funcionando perfeitamente), você precisa:

### Opção 1: Deploy via Git (Recomendado)

Se a Hostinger suporta Node.js e Git:

1. Conecte o repositório Git no painel da Hostinger
2. Configure:
   - **Build command:** `npm install && node scripts/prisma-generate.js && npm run build`
   - **Start command:** `npm start`
   - **Node version:** 18 ou 20

### Opção 2: Deploy Manual do Next.js Build

1. Faça build localmente:
   ```bash
   npm install
   node scripts/prisma-generate.js
   npm run build
   ```

2. Envie a pasta `.next/` e outros arquivos necessários via FTP

### Opção 3: Usar Script de Deploy Corrigido

Use o novo script `deploy-nextjs-ftp.sh` que está sendo criado.

## 📋 Arquivos que DEVEM ser enviados (Next.js):

- `.next/` (pasta de build)
- `node_modules/` (ou instalar no servidor)
- `package.json`
- `package-lock.json`
- `next.config.js`
- `prisma/` (schema e migrations)
- `public/` (assets estáticos)
- `.env` (variáveis de ambiente - configurar no servidor)

## 📋 Arquivos que NÃO devem ser enviados:

- `php/` (versão antiga - não usar mais)
- `.git/`
- `node_modules/` (se instalar no servidor)
- `.next/` (se fizer build no servidor)

## 🔧 Próximos Passos

1. ✅ Problema identificado
2. ⏳ Criar script de deploy correto para Next.js
3. ⏳ Testar deploy com arquivos corretos
