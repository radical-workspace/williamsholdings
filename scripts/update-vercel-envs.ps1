<#
This helper does two things:
 1) Reads .env.local (repo root), prints a masked preview of variables and the Vercel CLI commands to add them.
 2) Writes a second script `scripts\_apply-vercel-envs.ps1` containing the full `vercel env add` commands for you to run locally.

Usage:
  pwsh ./scripts/update-vercel-envs.ps1

Notes:
 - It will NOT run vercel CLI for you. It only generates the commands.
 - SUPABASE_SERVICE_ROLE_KEY (if present) will be masked and left for you to set manually in Vercel (recommended: set it in the Vercel dashboard as a server-only variable).
 - Ensure you have the Vercel CLI installed and are logged in, or copy the commands into the Vercel dashboard.
#>

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$envFileCandidate = Join-Path $scriptRoot "..\.env.local"
if (-not (Test-Path $envFileCandidate)) {
    Write-Error "Could not find .env.local at $envFileCandidate. Run this script from the repo or move it to the repo/scripts folder."
    exit 1
}

$envFile = Resolve-Path $envFileCandidate
$lines = Get-Content $envFile

function StripQuotes($s){
    if ($s -match '^\s*".*"\s*$' -or $s -match "^\s*'.*'\s*$"){
        return $s.Trim().Substring(1,$s.Trim().Length-2)
    }
    return $s.Trim()
}

function MaskValue($val){
    if (-not $val) { return "" }
    if ($val.Length -le 12) { return ('*' * $val.Length) }
    return $val.Substring(0,4) + '...' + $val.Substring($val.Length-4)
}

$applyScriptPath = Join-Path $scriptRoot "_apply-vercel-envs.ps1"
$applyScript = @()
$applyScript += "# Auto-generated: run this script to apply envs to Vercel using the Vercel CLI"
$applyScript += "# Requires: vercel CLI installed and authenticated (https://vercel.com/docs/cli)"
$applyScript += "# Review the commands before running. This will run 'vercel env add' for each variable and environment."
$applyScript += "`n"

Write-Host "Reading $envFile" -ForegroundColor Cyan
Write-Host "Preview (masked) and suggested commands for Vercel:" -ForegroundColor Cyan
Write-Host "-------------------------------------------------`n" -ForegroundColor Cyan

foreach ($line in $lines){
    if ($line -match '^\s*#' -or $line -match '^\s*$') { continue }
    if ($line -notmatch '=') { continue }
    $parts = $line -split '=',2
    $name = $parts[0].Trim()
    $rawVal = $parts[1]
    $val = StripQuotes $rawVal

    $isServerSecret = $name -match 'SERVICE_ROLE|SERVICE-ROLE|SERVICE_ROLE_KEY|SERVICE.*KEY|SECRET|PASSWORD|TOKEN'

    if ($isServerSecret) {
        $displayVal = '<HIDDEN: set this in Vercel dashboard (server-only)>'
    } else {
        $displayVal = MaskValue $val
    }

    Write-Host "$name = $displayVal" -ForegroundColor Yellow

    # By default generate commands for production and preview envs
    $envs = @('production','preview')
    foreach ($e in $envs){
        if ($isServerSecret) {
            # Add a commented reminder to set server secrets manually
            $applyScript += "# REMINDER: set $name in Vercel as a server-only variable for environment: $e"
            $applyScript += "# vercel env add $name <value> $e"
        } else {
            # Escape double quotes in value
            $escapedVal = $val -replace '"', '""'
            $applyScript += "vercel env add $name \"$escapedVal\" $e --yes"
        }
    }
    $applyScript += "`n"
}

# Write the apply script file (overwrites existing)
Set-Content -Path $applyScriptPath -Value $applyScript -Encoding UTF8

Write-Host "`nWrote apply script to: $applyScriptPath" -ForegroundColor Green
Write-Host "To review and run the apply script (will call vercel CLI):" -ForegroundColor Cyan
Write-Host "  pwsh $applyScriptPath" -ForegroundColor White
Write-Host "\nIf any variable is a server-only secret (SUPABASE_SERVICE_ROLE_KEY), set it manually in the Vercel dashboard for Production only." -ForegroundColor Magenta
Write-Host "Done." -ForegroundColor Green
