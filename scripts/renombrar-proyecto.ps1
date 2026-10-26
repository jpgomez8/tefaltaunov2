$ErrorActionPreference = 'Stop'
$original = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$parent = Split-Path -Parent $original
$destination = Join-Path $parent 'Project-05-Falta-Uno-Octubre-2026'
if ((Split-Path -Leaf $original) -ne 'Project-05-Sistema-Futbol-Octubre-2026') {
    throw 'Este script solo renombra la carpeta original del proyecto.'
}
if (Test-Path -LiteralPath $destination) {
    throw 'El destino ya existe. No se ha modificado ninguna carpeta.'
}
$linkRelative = 'apps\backend\node_modules\@comunidad\database'
$oldLink = Join-Path $original $linkRelative
if (Test-Path -LiteralPath $oldLink) {
    $item = Get-Item -LiteralPath $oldLink
    if ($item.LinkType -ne 'Junction' -or [IO.Path]::GetFullPath($item.Target[0]) -ne (Join-Path $original 'packages\database')) {
        throw 'El enlace local de database no es el esperado. No se ha modificado ninguna carpeta.'
    }
}
Set-Location -LiteralPath $parent
try {
    Rename-Item -LiteralPath $original -NewName 'Project-05-Falta-Uno-Octubre-2026'
} catch {
    throw 'Windows mantiene la carpeta en uso. Cierra VS Code y sus terminales; ejecuta este script desde una ventana externa de PowerShell.'
}
$link = Join-Path $destination $linkRelative
if (Test-Path -LiteralPath $link -PathType Container) {
    # Elimina solo el enlace, nunca la carpeta a la que apunta.
    [IO.Directory]::Delete($link)
} elseif ([IO.Directory]::Exists((Split-Path -Parent $link))) {
    # Un junction cuyo destino dejó de existir no aparece con Test-Path.
    $dangling = Get-ChildItem -LiteralPath (Split-Path -Parent $link) -Force | Where-Object Name -eq 'database'
    if ($dangling) { [IO.Directory]::Delete($link) }
}
if (Test-Path -LiteralPath (Split-Path -Parent $link)) {
    New-Item -ItemType Junction -Path $link -Target (Join-Path $destination 'packages\database') | Out-Null
}
Write-Output "Proyecto renombrado: $destination"
Write-Output 'Abre esa carpeta en VS Code e inicia Docker, backend y frontend con los comandos habituales.'
