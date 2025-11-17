@echo off
REM === Daily Training Tracker - Test Script ===
REM This script opens the website in your default browser

title Daily Training Tracker - Local Test
color 0A

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║   Daily Training Tracker - اختبار محلي             ║
echo ║   Coach Khaled Safwat                                 ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo جاري فتح الموقع في المتصفح...
echo.

REM Get the current directory
set "currentDir=%cd%"

REM Open index.html in default browser
start "" "%currentDir%\index.html"

echo ✓ تم فتح النموذج!
echo.
echo 📋 ما يمكنك فعله:
echo   1. ملء النموذج بالبيانات
echo   2. جرّب رفع صورة
echo   3. اختبر جميع الحقول
echo   4. تأكد أن كل شيء يعمل بشكل صحيح
echo.
echo 📝 ملاحظات:
echo   • زر "إرسال" لن يعمل محلياً (طبيعي)
echo   • سيعمل بعد النشر على Netlify
echo.
echo 📖 للمزيد من التفاصيل:
echo   اقرأ ملف START_HERE.md أو GUIDE.md
echo.
pause
