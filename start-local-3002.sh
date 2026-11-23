#!/usr/bin/env zsh
export PATH="/Users/krzysztofjarzyna/.gemini/antigravity/scratch/.node/bin:$PATH"
export NEXT_TELEMETRY_DISABLED=1
cd "/Users/krzysztofjarzyna/.gemini/antigravity/scratch/bmclinic-pr3"
exec npx next dev -p "${PORT:-3002}"
