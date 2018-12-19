$sourcePath = '.\build\Equim.js';
$targetPath = '.\example\js';
$targetFileName = 'equim.js'

browserify --external jimp $sourcePath -o $($targetPath + '\' + $targetFileName)

$blurFile = Get-Content $($targetPath + '\' + $targetFileName);
$replacedBlurFile = $blurFile.replace('const Jimp = require("jimp");', '');
$replacedBlurFile = $replacedBlurFile.replace('exports.Equim = Equim;', 'exports.Equim = Equim;' + [Environment]::NewLine + 'window.equim = Equim;');

$replacedBlurFile = ($replacedBlurFile | Out-String).Trim();
New-Item -Path $targetPath -Name $targetFileName -ItemType "file" -Force -Value $replacedBlurFile | Out-Null;