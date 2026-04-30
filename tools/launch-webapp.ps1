# Legal Dream Team launcher.
# Starts the local dev server (or reuses an existing one), waits for the
# port to come up, opens the default browser to the app, and exits.
# Run via tools\Legal Dream Team.cmd or a Windows shortcut that points
# at this script. Errors are written to tools\launch.log so you can
# diagnose problems even when the script runs in a hidden window.

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$webappDir   = Join-Path $projectRoot "webapp"
$port        = 5173
$url         = "http://localhost:$port/Legal-Dream-Team/"
$logPath     = Join-Path $PSScriptRoot "launch.log"

function Log {
  param([string]$Message, [string]$Level = "INFO")
  $stamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  "$stamp [$Level] $Message" | Add-Content -Path $logPath -Encoding utf8
  Write-Host "$stamp [$Level] $Message"
}

function Fail {
  param([string]$Message)
  Log -Message $Message -Level "ERROR"
  exit 1
}

# Reset log on each run so it does not grow forever.
"" | Set-Content -Path $logPath -Encoding utf8
Log "Launcher started. Project root: $projectRoot"

if (-not (Test-Path $webappDir)) {
  Fail "webapp directory not found at $webappDir"
}

Set-Location $webappDir

# First run npm install if node_modules is missing. Skipped after that.
if (-not (Test-Path (Join-Path $webappDir "node_modules"))) {
  Log "First run. Installing dependencies (one time)." "INFO"
  & npm install 2>&1 | Tee-Object -FilePath $logPath -Append | Out-Null
  if ($LASTEXITCODE -ne 0) {
    Fail "npm install failed with exit code $LASTEXITCODE. See $logPath."
  }
}

function Test-Port {
  param([int]$Port)
  try {
    $c   = New-Object System.Net.Sockets.TcpClient
    $iar = $c.BeginConnect("127.0.0.1", $Port, $null, $null)
    $ok  = $iar.AsyncWaitHandle.WaitOne(250, $false)
    if ($ok -and $c.Connected) { $c.Close(); return $true }
    $c.Close()
    return $false
  } catch { return $false }
}

if (Test-Port -Port $port) {
  Log "Dev server already running on port $port. Reusing."
} else {
  Log "Starting dev server on port $port."
  # Spawn npm in a separate minimized cmd window so the server keeps
  # running after this launcher exits. Closing that window stops the server.
  $cmdLine = "cd /d `"$webappDir`" && npm run dev -- --port $port --strictPort"
  Start-Process -FilePath "cmd.exe" -ArgumentList "/k",$cmdLine -WindowStyle Minimized | Out-Null

  # Wait up to 60 seconds for the port to open.
  $waited = 0
  while (-not (Test-Port -Port $port)) {
    Start-Sleep -Milliseconds 500
    $waited += 500
    if ($waited -ge 60000) {
      Fail "Server did not come up within 60 seconds. Check the dev server window."
    }
  }
  Log "Server up after $($waited) ms."
}

Log "Opening browser at $url."
Start-Process $url
exit 0
