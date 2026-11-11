#!/usr/bin/env bash
set -euo pipefail

echo "=================================================================="
echo " BM CLINIC (bmclinic.co) — ZBUDOWANIE STRONY W VERCEL PRZED PUBLIKACJĄ"
echo "=================================================================="

if ! command -v vercel >/dev/null 2>&1; then
  echo "[!] Brak zainstalowanego Vercel CLI. Zainstaluj: npm i -g vercel"
  exit 1
fi

echo "=== [1/4] Pobieranie konfiguracji środowiska z Vercel ==="
vercel pull --yes --environment=production

echo "=== [2/4] Budowanie paczki produkcyjnej Next.js 15 (.vercel/output) ==="
vercel build --prod

echo "=== [3/4] Wysyłanie zbudowanej strony na Vercel BEZ przypisywania domeny głównej (--skip-domain) ==="
STAGED_URL=$(vercel deploy --prebuilt --prod --skip-domain)
echo ""
echo "✅ Strona została zbudowana i wdrożona pod adresem testowym (Staged Production):"
echo "   👉 $STAGED_URL"
echo ""

echo "=== [4/4] Weryfikacja punktu kontrolnego /api/health ==="
vercel curl /api/health --deployment "$STAGED_URL" || true

echo ""
echo "=================================================================="
echo " GOTOWE DO PODGLĄDU PRZED PUBLIKACJĄ!"
echo " 1. Otwórz powyższy adres URL, aby przetestować zbudowaną stronę."
echo " 2. Aby opublikować ten gotowy build na domenie bmclinic.co (0s przebudowy):"
echo "    vercel promote \"$STAGED_URL\""
echo "    (lub kliknij 'Promote to Production' w panelu Vercel Dashboard)"
echo "=================================================================="
