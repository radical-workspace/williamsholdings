# Simple helper to apply SQL migrations to Supabase via the CLI if installed
# Usage: .\scripts\apply-migrations.ps1 -FilePath migrations\20250831_manual_financial_flow.sql
param(
  [string]$FilePath = "migrations\20250831_manual_financial_flow.sql"
)

Write-Host "This script helps you apply migrations to Supabase. It will attempt to use the 'supabase' CLI if available."
if (Get-Command supabase -ErrorAction SilentlyContinue) {
  Write-Host "Found supabase CLI. Running: supabase db remote commit --file $FilePath"
  supabase db remote commit --file $FilePath
} else {
  Write-Host "supabase CLI not found. Open the file in your editor and paste into Supabase Console SQL editor: $FilePath"
}
