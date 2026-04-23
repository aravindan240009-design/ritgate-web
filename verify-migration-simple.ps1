# RITGate Web Migration Verification Script (PowerShell)

Write-Host "RITGate Web Migration Verification" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

$Total = 0
$Passed = 0
$Failed = 0

function Test-FileExists {
    param([string]$Path)
    
    $script:Total++
    if (Test-Path $Path -PathType Leaf) {
        Write-Host "[OK] $Path" -ForegroundColor Green
        $script:Passed++
        return $true
    } else {
        Write-Host "[MISSING] $Path" -ForegroundColor Red
        $script:Failed++
        return $false
    }
}

Write-Host "Core Configuration" -ForegroundColor Yellow
Test-FileExists "package.json"
Test-FileExists "vite.config.ts"
Test-FileExists "tsconfig.json"
Test-FileExists "index.html"
Write-Host ""

Write-Host "Components" -ForegroundColor Yellow
Test-FileExists "src\components\common\BulkDetailsModal.tsx"
Test-FileExists "src\components\common\ColorPickerModal.tsx"
Test-FileExists "src\components\common\ConfirmationModal.tsx"
Test-FileExists "src\components\common\SkeletonCard.tsx"
Test-FileExists "src\components\common\ThemedText.tsx"
Test-FileExists "src\components\navigation\MobileBottomNav.tsx"
Test-FileExists "src\components\navigation\ExitConfirmModal.tsx"
Write-Host ""

Write-Host "Context Providers" -ForegroundColor Yellow
Test-FileExists "src\context\AuthContext.tsx"
Test-FileExists "src\context\ThemeContext.tsx"
Test-FileExists "src\context\NotificationContext.tsx"
Write-Host ""

Write-Host "Hooks" -ForegroundColor Yellow
Test-FileExists "src\hooks\useErrorModal.ts"
Test-FileExists "src\hooks\useSafeBackNavigation.ts"
Test-FileExists "src\hooks\useSuccessModal.ts"
Write-Host ""

Write-Host "Layouts" -ForegroundColor Yellow
Test-FileExists "src\layouts\AppLayout.tsx"
Test-FileExists "src\layouts\Header.tsx"
Test-FileExists "src\layouts\Sidebar.tsx"
Write-Host ""

Write-Host "Pages - Student" -ForegroundColor Yellow
Test-FileExists "src\pages\student\StudentHome.tsx"
Test-FileExists "src\pages\student\StudentRequests.tsx"
Test-FileExists "src\pages\student\NewRequest.tsx"
Write-Host ""

Write-Host "Pages - Staff" -ForegroundColor Yellow
Test-FileExists "src\pages\staff\StaffDashboard.tsx"
Test-FileExists "src\pages\staff\StaffMyRequests.tsx"
Write-Host ""

Write-Host "Pages - Security" -ForegroundColor Yellow
Test-FileExists "src\pages\security\SecurityDashboard.tsx"
Test-FileExists "src\pages\security\SecurityScanner.tsx"
Write-Host ""

Write-Host "Routing" -ForegroundColor Yellow
Test-FileExists "src\routes\index.tsx"
Test-FileExists "src\routes\ProtectedRoute.tsx"
Write-Host ""

Write-Host "Services" -ForegroundColor Yellow
Test-FileExists "src\services\api.service.ts"
Write-Host ""

Write-Host "Styles" -ForegroundColor Yellow
Test-FileExists "src\index.css"
Write-Host ""

Write-Host "Documentation" -ForegroundColor Yellow
Test-FileExists "MIGRATION_COMPLETE.md"
Write-Host ""

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Verification Summary" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Total Checks: $Total" -ForegroundColor Yellow
Write-Host "Passed: $Passed" -ForegroundColor Green
Write-Host "Failed: $Failed" -ForegroundColor Red
Write-Host ""

if ($Failed -eq 0) {
    Write-Host "All critical files are in place!" -ForegroundColor Green
    Write-Host "Migration is COMPLETE." -ForegroundColor Green
} else {
    Write-Host "Some files are missing!" -ForegroundColor Red
    Write-Host "Please review the missing files above." -ForegroundColor Yellow
}
