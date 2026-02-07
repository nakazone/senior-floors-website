#!/bin/bash

# Script de Deploy Automatizado para Next.js - Senior Floors
# Este script faz build do Next.js e envia os arquivos corretos via FTP
# Uso: ./deploy-nextjs-ftp.sh

set -e  # Parar em caso de erro

echo "🚀 Deploy Automatizado - Senior Floors (Next.js)"
echo "=================================================="
echo ""

# Verificar se está na pasta correta
if [ ! -f "package.json" ] || [ ! -f "next.config.js" ]; then
    echo "❌ Execute este script na raiz do projeto (onde está package.json)"
    exit 1
fi

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js 18+ primeiro."
    exit 1
fi

echo "✅ Node.js $(node -v) encontrado"
echo ""

# Passo 1: Instalar dependências
echo "📦 Instalando dependências..."
npm install
echo "✅ Dependências instaladas"
echo ""

# Passo 2: Gerar Prisma Client
if [ -f "prisma/schema.prisma" ]; then
    echo "🔧 Gerando Prisma Client..."
    node scripts/prisma-generate.js || npx prisma generate
    echo "✅ Prisma Client gerado"
    echo ""
fi

# Passo 3: Fazer build do Next.js
echo "🏗️  Fazendo build do Next.js..."
npm run build
echo "✅ Build concluído"
echo ""

# Verificar se o build foi criado
if [ ! -d ".next" ]; then
    echo "❌ Erro: Pasta .next não foi criada. Build falhou."
    exit 1
fi

# Passo 4: Criar pacote de deploy
echo "📦 Criando pacote de deploy..."
DEPLOY_DIR="deploy-nextjs-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$DEPLOY_DIR"

# Copiar arquivos necessários
echo "  📄 Copiando arquivos..."
cp -r .next "$DEPLOY_DIR/"
cp -r public "$DEPLOY_DIR/" 2>/dev/null || true
cp -r prisma "$DEPLOY_DIR/" 2>/dev/null || true
cp package.json "$DEPLOY_DIR/"
cp package-lock.json "$DEPLOY_DIR/" 2>/dev/null || true
cp next.config.js "$DEPLOY_DIR/"
cp -r scripts "$DEPLOY_DIR/" 2>/dev/null || true

# Criar arquivo .env.example se não existir
if [ ! -f "$DEPLOY_DIR/.env.example" ]; then
    cat > "$DEPLOY_DIR/.env.example" << EOF
# URL do site
NEXT_PUBLIC_SITE_URL=https://www.senior-floors.com/newsite

# Banco de dados
DATABASE_URL="file:./prisma/dev.db"

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://www.senior-floors.com/newsite
EOF
fi

# Criar script de start
cat > "$DEPLOY_DIR/start.sh" << 'EOF'
#!/bin/bash
# Script para iniciar o servidor Next.js no servidor
npm install --production
node scripts/prisma-generate.js || npx prisma generate
npm start
EOF
chmod +x "$DEPLOY_DIR/start.sh"

# Criar ZIP
echo "  📦 Criando arquivo ZIP..."
ZIP_NAME="deploy-nextjs-$(date +%Y%m%d-%H%M%S).zip"
cd "$DEPLOY_DIR"
zip -r "../$ZIP_NAME" . -x "*.git*" "*.DS_Store" "*.log"
cd ..
rm -rf "$DEPLOY_DIR"

echo "✅ Pacote criado: $ZIP_NAME"
echo ""

# Passo 5: Solicitar credenciais FTP
echo "📤 Configuração FTP:"
echo ""
read -p "🌐 Host FTP (ex: ftp.senior-floors.com): " FTP_HOST
read -p "👤 Username FTP: " FTP_USER
read -s -p "🔒 Password FTP: " FTP_PASS
echo ""
read -p "📁 Caminho remoto (ex: /public_html/newsite ou /domains/senior-floors.com/public_html/newsite): " FTP_PATH

if [ ! "$FTP_PATH" ]; then
    FTP_PATH="/public_html/newsite"
fi

echo ""
echo "📤 Fazendo upload para $FTP_HOST$FTP_PATH..."
echo ""

# Usar curl para fazer upload via FTP
curl -T "$ZIP_NAME" \
     --user "$FTP_USER:$FTP_PASS" \
     "ftp://$FTP_HOST$FTP_PATH/$ZIP_NAME"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Upload concluído!"
    echo ""
    echo "⚠️  IMPORTANTE: Próximos passos no servidor:"
    echo ""
    echo "1. Acesse o File Manager da Hostinger"
    echo "2. Vá até $FTP_PATH"
    echo "3. Extraia o arquivo $ZIP_NAME"
    echo "4. Configure variáveis de ambiente (.env) no servidor"
    echo "5. Instale dependências: cd $FTP_PATH && npm install --production"
    echo "6. Gere Prisma: npx prisma generate"
    echo "7. Inicie o servidor: npm start"
    echo ""
    echo "🌐 Ou configure Node.js Web App no painel da Hostinger"
    echo ""
else
    echo ""
    echo "❌ Erro no upload. Verifique as credenciais FTP."
    echo ""
fi
