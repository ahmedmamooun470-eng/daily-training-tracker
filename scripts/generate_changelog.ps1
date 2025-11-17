<#
Generate a static `changelog.html` from the local git log.

Usage:
  Open PowerShell in the repository root and run:
    .\scripts\generate_changelog.ps1

This script writes `changelog.html` to the repository root.
#>

Param()

function HtmlEncode([string]$text) {
    $text = $text -replace '&', '&amp;'
    $text = $text -replace '<', '&lt;'
    $text = $text -replace '>', '&gt;'
    $text = $text -replace '"', '&quot;'
    $text = $text -replace "'", '&#39;'
    return $text
}

try {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
    Push-Location $scriptDir\..\

    # Number of commits to include (adjust as needed)
    $limit = 200

    # Get git log: short-hash | author | date | subject
    $gitCmd = "git log --pretty=format:`"%h|%an|%ad|%s`" --date=short -n $limit"
    $gitOutput = & cmd /c $gitCmd

    $rows = @()
    if ($gitOutput) {
        foreach ($line in $gitOutput -split "`n") {
            $parts = $line -split '\|',4
            if ($parts.Count -ge 4) {
                $hash = HtmlEncode($parts[0])
                $author = HtmlEncode($parts[1])
                $date = HtmlEncode($parts[2])
                $msg = HtmlEncode($parts[3])
                $rows += "<tr><td><code>$hash</code></td><td>$author</td><td>$date</td><td>$msg</td></tr>"
            }
        }
    } else {
        $rows += "<tr><td colspan=4>No git history found.</td></tr>"
    }

    $rowsHtml = $rows -join "`n"

    $html = @"
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Changelog - Daily Training Tracker (Local)</title>
  <link rel="stylesheet" href="changelog.css">
</head>
<body>
  <div class="wrap">
    <header>
      <h1>Project Changelog</h1>
      <p>Generated from local <code>git log</code> (last $limit commits).</p>
      <p><a href="index.html">Open site index</a> · <a href="https://github.com/ahmedmamooun470-eng/daily-training-tracker">Repo on GitHub</a></p>
    </header>

    <table class="changelog">
      <thead><tr><th>Commit</th><th>Author</th><th>Date</th><th>Message</th></tr></thead>
      <tbody>
$rowsHtml
      </tbody>
    </table>
  </div>
</body>
</html>
"@

    $outPath = Join-Path (Get-Location) 'changelog.html'
    $html | Out-File -FilePath $outPath -Encoding UTF8
    Write-Host "Generated changelog at: $outPath"

} catch {
    Write-Error "Failed to generate changelog: $_"
} finally {
    Pop-Location -ErrorAction SilentlyContinue
}
