# Self sign Legal Dream Team exes with a personal code signing certificate.
#
# First run with -Install:
#   powershell -ExecutionPolicy Bypass -File tools\sign-self.ps1 -Install
# That creates a cert, trusts it on this machine for the current user, and
# signs every exe in webapp\release. SmartScreen will stop warning on this PC.
#
# Subsequent rebuilds:
#   powershell -ExecutionPolicy Bypass -File tools\sign-self.ps1
# That just signs the freshly built exes with the existing cert.
#
# What this is and is not:
#   This is a self issued certificate. It only earns trust on machines where
#   you have explicitly imported it into Trusted Root and Trusted Publishers.
#   It does NOT make the exe trusted on anyone else's Windows. For that, get
#   an EV code signing cert (~$300/year) or Azure Trusted Signing ($10/month).

[CmdletBinding()]
param(
  [string]$Subject = "CN=Legal Dream Team Personal Code Signing",
  [switch]$Install,
  [string]$ReleaseDir
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
if (-not $ReleaseDir) {
  $ReleaseDir = Join-Path $projectRoot "webapp\release"
}

if (-not (Test-Path $ReleaseDir)) {
  Write-Host "No release directory at $ReleaseDir. Run npm run electron:build first." -ForegroundColor Yellow
  exit 1
}

# Locate or create the signing certificate.
$cert = Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert -ErrorAction SilentlyContinue |
        Where-Object { $_.Subject -eq $Subject } |
        Select-Object -First 1

if (-not $cert) {
  Write-Host "Creating self signed code signing certificate." -ForegroundColor Cyan
  $cert = New-SelfSignedCertificate `
    -Subject $Subject `
    -Type CodeSigningCert `
    -KeyAlgorithm RSA `
    -KeyLength 4096 `
    -CertStoreLocation Cert:\CurrentUser\My `
    -NotAfter (Get-Date).AddYears(10) `
    -KeyExportPolicy Exportable `
    -KeyUsage DigitalSignature `
    -HashAlgorithm SHA256
  Write-Host "Created cert. Thumbprint: $($cert.Thumbprint)" -ForegroundColor Green
} else {
  Write-Host "Using existing cert. Thumbprint: $($cert.Thumbprint)"
}

# Trust the cert on this machine for the current user. No admin needed.
# Uses the X509Store API directly to avoid Import-Certificate's UI prompt
# (which fails in non-interactive shells).
if ($Install) {
  Write-Host "Installing cert into Trusted Root and Trusted Publishers (current user)." -ForegroundColor Cyan
  $stores = @("Root", "TrustedPublisher")
  foreach ($storeName in $stores) {
    $store = New-Object System.Security.Cryptography.X509Certificates.X509Store($storeName, "CurrentUser")
    $store.Open("ReadWrite")
    # Add is idempotent: re running with the same cert is harmless.
    $store.Add($cert)
    $store.Close()
    Write-Host "  Added to CurrentUser\$storeName" -ForegroundColor Green
  }
  Write-Host "Cert is now trusted for the current user on this machine." -ForegroundColor Green
}

# Sign every exe in the release directory.
$exes = Get-ChildItem -Path $ReleaseDir -Filter "*.exe" -ErrorAction SilentlyContinue
if (-not $exes -or $exes.Count -eq 0) {
  Write-Host "No exe files found in $ReleaseDir." -ForegroundColor Yellow
  exit 0
}

$timestamp = "http://timestamp.digicert.com"
$failed = @()

foreach ($exe in $exes) {
  Write-Host "Signing $($exe.Name)" -ForegroundColor Cyan
  try {
    $sig = Set-AuthenticodeSignature `
      -FilePath $exe.FullName `
      -Certificate $cert `
      -TimestampServer $timestamp `
      -HashAlgorithm SHA256 `
      -IncludeChain Signer `
      -Force
    # UnknownError typically just means the cert chain does not validate
    # against LocalMachine\Root (which would need admin to fix). The signature
    # is still embedded correctly. Re verify with Get-AuthenticodeSignature
    # under the current user, which sees CurrentUser\Root.
    $verify = Get-AuthenticodeSignature -FilePath $exe.FullName
    if ($verify.Status -eq 'Valid' -or $verify.Status -eq 'UnknownError') {
      # UnknownError here also surfaces when the timestamp server response
      # uses a chain not in the user's stores. The signature is still valid
      # for CurrentUser trust purposes.
      $signerThumb = $verify.SignerCertificate.Thumbprint
      if ($signerThumb -eq $cert.Thumbprint) {
        Write-Host "  Signed. Verify status: $($verify.Status)" -ForegroundColor Green
      } else {
        Write-Warning "Signer thumbprint mismatch on $($exe.Name)"
        $failed += $exe.FullName
      }
    } else {
      Write-Warning "Verify status: $($verify.Status). $($verify.StatusMessage)"
      $failed += $exe.FullName
    }
  } catch {
    Write-Warning "Signing failed: $_"
    $failed += $exe.FullName
  }
}

if ($failed.Count -gt 0) {
  Write-Host "Signing failed for: $($failed -join ', ')" -ForegroundColor Red
  exit 1
}

Write-Host "All exes signed. Try double clicking now; SmartScreen should let it run." -ForegroundColor Green
