$ErrorActionPreference = 'Stop'
$propertiesPath = Join-Path $PSScriptRoot 'maven-wrapper.properties'
$properties = @{}
Get-Content $propertiesPath | ForEach-Object {
    if ($_ -match '^([^#=]+)=(.*)$') {
        $properties[$matches[1].Trim()] = $matches[2].Trim()
    }
}
$url = $properties['distributionUrl']
$expectedHash = $properties['distributionSha512Sum']
if (-not $url -or -not $expectedHash) { throw 'Configuracao Maven Wrapper incompleta.' }
$installParent = Join-Path $HOME '.m2\wrapper\dists'
$installPath = Join-Path $installParent 'apache-maven-3.9.11'
$executable = Join-Path $installPath 'bin\mvn.cmd'
if (Test-Path $executable) { exit 0 }
New-Item -ItemType Directory -Path $installParent -Force | Out-Null
$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ('saal-maven-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tempRoot -Force | Out-Null
try {
    $zip = Join-Path $tempRoot 'maven.zip'
    Write-Host 'Baixando Maven 3.9.11 (primeira execucao)...'
    Invoke-WebRequest -Uri $url -OutFile $zip
    $actual = (Get-FileHash -Path $zip -Algorithm SHA512).Hash.ToLowerInvariant()
    if ($actual -ne $expectedHash.ToLowerInvariant()) {
        throw 'SHA-512 do Maven nao confere. Instalacao abortada.'
    }
    Expand-Archive -Path $zip -DestinationPath $tempRoot
    $extracted = Join-Path $tempRoot 'apache-maven-3.9.11'
    if (-not (Test-Path (Join-Path $extracted 'bin\mvn.cmd'))) {
        throw 'Arquivo Maven baixado sem bin/mvn.cmd.'
    }
    if (-not (Test-Path $executable)) {
        Move-Item -Path $extracted -Destination $installPath
    }
    if (-not (Test-Path $executable)) { throw 'Maven nao foi instalado.' }
}
finally {
    Remove-Item -Path $tempRoot -Recurse -Force -ErrorAction SilentlyContinue
}
