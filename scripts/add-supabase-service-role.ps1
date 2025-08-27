<#
Script: add-supabase-service-role.ps1
Purpose: Prompt for your Supabase service role key securely and add it to the linked Vercel project as a server-only env var.
Security: This script does NOT store the key in the repo. Do not hard-code secrets here.
Usage: Run from the repo root after `vercel login` and `vercel link`.
#>

param(
    [string]$VarName = "SUPABASE_SERVICE_ROLE_KEY",
    [ValidateSet('development','preview','production')] [string]$Environment = 'production'
)

Write-Host "This will add the server-only environment variable '$VarName' to the linked Vercel project (scope: $Environment)."
Write-Host "Ensure you've run 'vercel login' and 'vercel link' already."

# Prompt securely for the key
$secure = Read-Host -AsSecureString "Enter the Supabase service role key (input will be hidden)"
if (-not $secure) {
    Write-Host "No key entered. Aborting." -ForegroundColor Yellow
    exit 1
}

# Convert SecureString to plaintext for the single CLI call, then zero it out.
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
    $key = [Runtime.InteropServices.Marshal]::PtrToStringAuto($ptr)
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
}

Write-Host "Ready to add variable '$VarName' to Vercel (environment: $Environment)."
$ok = Read-Host "Proceed? Type 'y' or 'yes' to continue"
# Accept 'y' or 'yes' (case-insensitive)
if (-not ($ok) -or ($ok.ToLower() -ne 'y' -and $ok.ToLower() -ne 'yes')) {
    Write-Host "Aborted by user." -ForegroundColor Yellow
    # Zero sensitive value
    $key = $null
    exit 1
}

# Run the Vercel CLI command. --yes to avoid interactive confirm where supported.
# Call the Vercel CLI directly with separate arguments to avoid shell-escaping issues.
Write-Host "Running: vercel env add $VarName [hidden] $Environment"

# Ensure Vercel CLI is available
$vercelCmd = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelCmd) {
    Write-Host "Vercel CLI not found. Install it with: npm install -g vercel" -ForegroundColor Red
    # Zero sensitive value
    $key = $null
    exit 1
}

try {
    # Start a process and capture exit code; avoid building a single command string.
    $proc = Start-Process -FilePath $vercelCmd.Source -ArgumentList @('env','add',$VarName,$key,$Environment) -NoNewWindow -Wait -PassThru
    if ($proc.ExitCode -ne 0) {
        Write-Host "Vercel CLI exited with code $($proc.ExitCode). Check your network/credentials and try again." -ForegroundColor Red
        $key = $null
        exit $proc.ExitCode
    }
} catch {
    Write-Host "Error running vercel CLI: $_" -ForegroundColor Red
    # Zero sensitive value before exit
    $key = $null
    exit 1
}

# Clear sensitive data from memory
$key = $null
$secure = $null
Write-Host "Done. The variable should now be set in Vercel for environment: $Environment" -ForegroundColor Green
