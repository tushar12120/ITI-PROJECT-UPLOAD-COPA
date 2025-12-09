Add-Type -AssemblyName System.Drawing

$sizes = @(72, 96, 128, 144, 152, 192, 384, 512)
$iconsPath = "a:\ITI PROJECT UPLOAD COPA\icons"

foreach ($size in $sizes) {
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    
    # Background gradient (dark blue)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.Point(0, 0)),
        (New-Object System.Drawing.Point($size, $size)),
        [System.Drawing.ColorTranslator]::FromHtml("#1e293b"),
        [System.Drawing.ColorTranslator]::FromHtml("#0f172a")
    )
    
    # Rounded rectangle background
    $cornerRadius = [int]($size * 0.15)
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc(0, 0, $cornerRadius * 2, $cornerRadius * 2, 180, 90)
    $path.AddArc($size - $cornerRadius * 2, 0, $cornerRadius * 2, $cornerRadius * 2, 270, 90)
    $path.AddArc($size - $cornerRadius * 2, $size - $cornerRadius * 2, $cornerRadius * 2, $cornerRadius * 2, 0, 90)
    $path.AddArc(0, $size - $cornerRadius * 2, $cornerRadius * 2, $cornerRadius * 2, 90, 90)
    $path.CloseFigure()
    $graphics.FillPath($brush, $path)
    
    # Icon gradient (purple to blue)
    $iconBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.Point(0, 0)),
        (New-Object System.Drawing.Point($size, $size)),
        [System.Drawing.ColorTranslator]::FromHtml("#6366f1"),
        [System.Drawing.ColorTranslator]::FromHtml("#0ea5e9")
    )
    
    # Document rectangle
    $docX = [int]($size * 0.22)
    $docY = [int]($size * 0.18)
    $docW = [int]($size * 0.4)
    $docH = [int]($size * 0.5)
    $docRect = New-Object System.Drawing.Rectangle($docX, $docY, $docW, $docH)
    $graphics.FillRectangle($iconBrush, $docRect)
    
    # Lines on document
    $lineBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(200, 255, 255, 255))
    $lineY1 = [int]($size * 0.28)
    $lineY2 = [int]($size * 0.36)
    $lineY3 = [int]($size * 0.44)
    $lineW1 = [int]($size * 0.28)
    $lineW2 = [int]($size * 0.22)
    $lineW3 = [int]($size * 0.16)
    $lineH = [int]($size * 0.03)
    $lineX = [int]($size * 0.27)
    $graphics.FillRectangle($lineBrush, $lineX, $lineY1, $lineW1, $lineH)
    $graphics.FillRectangle($lineBrush, $lineX, $lineY2, $lineW2, $lineH)
    $graphics.FillRectangle($lineBrush, $lineX, $lineY3, $lineW3, $lineH)
    
    # Upload circle
    $circleX = [int]($size * 0.52)
    $circleY = [int]($size * 0.45)
    $circleSize = [int]($size * 0.35)
    $graphics.FillEllipse($iconBrush, $circleX, $circleY, $circleSize, $circleSize)
    
    # Upload arrow
    $arrowPen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, [int]($size * 0.025))
    $arrowPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $arrowPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $arrowCenterX = [int]($circleX + $circleSize / 2)
    $arrowTop = [int]($circleY + $circleSize * 0.25)
    $arrowBottom = [int]($circleY + $circleSize * 0.7)
    $arrowWidth = [int]($circleSize * 0.2)
    
    # Vertical line
    $graphics.DrawLine($arrowPen, $arrowCenterX, $arrowBottom, $arrowCenterX, $arrowTop)
    # Arrow head
    $graphics.DrawLine($arrowPen, [int]($arrowCenterX - $arrowWidth), [int]($arrowTop + $arrowWidth), $arrowCenterX, $arrowTop)
    $graphics.DrawLine($arrowPen, [int]($arrowCenterX + $arrowWidth), [int]($arrowTop + $arrowWidth), $arrowCenterX, $arrowTop)
    
    # ITI text
    $font = New-Object System.Drawing.Font("Arial", [int]($size * 0.08), [System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $text = "ITI COPA"
    $textSize = $graphics.MeasureString($text, $font)
    $textX = ($size - $textSize.Width) / 2
    $textY = [int]($size * 0.85)
    $graphics.DrawString($text, $font, $textBrush, $textX, $textY)
    
    # Save
    $filePath = Join-Path $iconsPath "icon-${size}x${size}.png"
    $bitmap.Save($filePath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $graphics.Dispose()
    $bitmap.Dispose()
    
    Write-Host "Created: icon-${size}x${size}.png"
}

Write-Host "All icons created successfully!"
