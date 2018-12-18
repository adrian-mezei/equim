$sourcePath = '.\build\blur\Blur.js';
$targetPath = '.\public\js';
$targetFileName = 'blur.js'

browserify --external jimp $sourcePath -o $($targetPath + '\' + $targetFileName)

$blurFile = Get-Content $($targetPath + '\' + $targetFileName);
$replacedBlurFile = $blurFile.replace('const Jimp = require("jimp");', '');
$replacedBlurFile = $replacedBlurFile.replace('exports.Blur = Blur;', 'exports.Blur = Blur;' + [Environment]::NewLine + 'window.blur = new Blur();');

$replacedBlurFile = ($replacedBlurFile | Out-String).Trim();
New-Item -Path $targetPath -Name $targetFileName -ItemType "file" -Force -Value $replacedBlurFile | Out-Null;