# Auto-generated script: apply Vercel environment variables using the Vercel CLI
# Requires: vercel CLI installed and authenticated (https://vercel.com/docs/cli)
# Review before running. This will add variables to the specified environments.

# NOTE: If a variable already exists, `vercel env add` will prompt; using --yes will attempt to overwrite/confirm.
# You can run each command interactively or run the whole script.

# Add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_URL "https://ciihrogqtiqhbwunqxja.supabase.co" production --yes
vercel env add NEXT_PUBLIC_SUPABASE_URL "https://ciihrogqtiqhbwunqxja.supabase.co" preview --yes

# Add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpaWhyb2dxdGlxaGJ3dW5xeGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxODIyMzgsImV4cCI6MjA3MDc1ODIzOH0.o4o1p3P0a0Kwnmj3TpUNmOtQb2J_p_bV1vhCksc-TKo" production --yes
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpaWhyb2dxdGlxaGJ3dW5xeGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxODIyMzgsImV4cCI6MjA3MDc1ODIzOH0.o4o1p3P0a0Kwnmj3TpUNmOtQb2J_p_bV1vhCksc-TKo" preview --yes

# Add NEXT_PUBLIC_DEFAULT_CURRENCY
vercel env add NEXT_PUBLIC_DEFAULT_CURRENCY "USD" production --yes
vercel env add NEXT_PUBLIC_DEFAULT_CURRENCY "USD" preview --yes

# Add NEXT_PUBLIC_BRAND_NAME
vercel env add NEXT_PUBLIC_BRAND_NAME "WilliamsHoldings" production --yes
vercel env add NEXT_PUBLIC_BRAND_NAME "WilliamsHoldings" preview --yes

# Add NEXT_PUBLIC_PRIMARY_HEX
vercel env add NEXT_PUBLIC_PRIMARY_HEX "#059669" production --yes
vercel env add NEXT_PUBLIC_PRIMARY_HEX "#059669" preview --yes

Write-Host "All vercel env add commands have been emitted. Review output for errors and then redeploy your project from the Vercel dashboard or run 'vercel --prod' to trigger a deploy." -ForegroundColor Green
