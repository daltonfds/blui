#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "======================================================"
echo " Blui — instalação no Termux"
echo "======================================================"

echo "[1/6] A atualizar pacotes do Termux…"
pkg update -y && pkg upgrade -y

echo "[2/6] A instalar Node.js, Git e ferramentas de build…"
pkg install -y nodejs-lts git python make clang

echo "[3/6] A verificar versões…"
node -v
npm -v

echo "[4/6] A instalar dependências do backend…"
cd backend
npm install
if [ ! -f .env ]; then
  cp .env.example .env
  echo "   -> backend/.env criado a partir do exemplo. Edita-o com as tuas chaves."
fi
cd ..

echo "[5/6] A instalar dependências do frontend…"
cd frontend
npm install
if [ ! -f .env ]; then
  cp .env.example .env
  echo "   -> frontend/.env criado a partir do exemplo. Edita-o com as tuas chaves."
fi
cd ..

echo "[6/6] Instalação concluída."
echo ""
echo "Antes de correr, edita:"
echo "  backend/.env   (Supabase, WhatsApp, Meta)"
echo "  frontend/.env  (Supabase, URL da API)"
echo ""
echo "Depois de configurado, corre em duas sessões do Termux:"
echo "  Sessão 1:  cd backend && npm start"
echo "  Sessão 2:  cd frontend && npm run dev -- --host"
echo ""
echo "Abre no telemóvel: http://localhost:5173"
