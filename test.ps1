# === Daily Training Tracker - Test Script (PowerShell) ===

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Daily Training Tracker - اختبار محلي             ║" -ForegroundColor Cyan
Write-Host "║   Coach Khaled Safwat                                 ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "جاري فتح الموقع في المتصفح..." -ForegroundColor Yellow

# Get the current directory
$currentDir = Get-Location
$indexPath = Join-Path $currentDir "index.html"

# Check if file exists
if (Test-Path $indexPath) {
    # Open in default browser
    Start-Process $indexPath
    
    Write-Host "`n✓ تم فتح النموذج بنجاح!" -ForegroundColor Green
} else {
    Write-Host "`n✗ خطأ: لم يتم العثور على ملف index.html" -ForegroundColor Red
    Write-Host "تأكد من أنك في المجلد الصحيح" -ForegroundColor Red
    exit
}

Write-Host "`n📋 ما يمكنك فعله:" -ForegroundColor Yellow
Write-Host "   1. ملء النموذج بالبيانات"
Write-Host "   2. جرّب رفع صورة"
Write-Host "   3. اختبر جميع الحقول"
Write-Host "   4. تأكد أن كل شيء يعمل بشكل صحيح"

Write-Host "`n📝 ملاحظات:" -ForegroundColor Yellow
Write-Host "   • زر 'إرسال' لن يعمل محلياً (طبيعي)"
Write-Host "   • سيعمل بعد النشر على Netlify"

Write-Host "`n📖 للمزيد من التفاصيل:" -ForegroundColor Yellow
Write-Host "   اقرأ ملف START_HERE.md أو GUIDE.md"

Write-Host "`n" -ForegroundColor Green
