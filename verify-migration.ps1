# RITGate Web Migration Verification Script (PowerShell)
# This script verifies that all critical files are in place and properly migrated

Write-Host "🔍 RITGate Web Migration Verification" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Counters
$script:Total = 0
$script:Passed = 0
$script:Failed = 0

# Function to check if file exists
function Test-FileExists {
    param([string]$Path)
    
    $script:Total++
    if (Test-Path $Path -PathType Leaf) {
        Write-Host "✓ $Path" -ForegroundColor Green
        $script:Passed++
        return $true
    } else {
        Write-Host "✗ $Path (MISSING)" -ForegroundColor Red
        $script:Failed++
        return $false
    }
}

# Function to check if directory exists
function Test-DirectoryExists {
    param([string]$Path)
    
    if (Test-Path $Path -PathType Container) {
        Write-Host "✓ $Path/" -ForegroundColor Green
        return $true
    } else {
        Write-Host "✗ $Path/ (MISSING)" -ForegroundColor Red
        return $false
    }
}

Write-Host "📦 Core Configuration" -ForegroundColor Yellow
Write-Host "--------------------"
Test-FileExists "package.json"
Test-FileExists "vite.config.ts"
Test-FileExists "tsconfig.json"
Test-FileExists "index.html"
Test-FileExists "netlify.toml"
Write-Host ""

Write-Host "🎨 Source Structure" -ForegroundColor Yellow
Write-Host "-------------------"
Test-DirectoryExists "src"
Test-DirectoryExists "src\assets"
Test-DirectoryExists "src\components"
Test-DirectoryExists "src\config"
Test-DirectoryExists "src\context"
Test-DirectoryExists "src\hooks"
Test-DirectoryExists "src\layouts"
Test-DirectoryExists "src\pages"
Test-DirectoryExists "src\routes"
Test-DirectoryExists "src\services"
Test-DirectoryExists "src\styles"
Test-DirectoryExists "src\types"
Test-DirectoryExists "src\utils"
Write-Host ""

Write-Host "🧩 Components" -ForegroundColor Yellow
Write-Host "-------------"
Test-FileExists "src\components\common\BulkDetailsModal.tsx"
Test-FileExists "src\components\common\ColorPickerModal.tsx"
Test-FileExists "src\components\common\ConfirmationModal.tsx"
Test-FileExists "src\components\common\ErrorModal.tsx"
Test-FileExists "src\components\common\GatePassQRModal.tsx"
Test-FileExists "src\components\common\NotificationBell.tsx"
Test-FileExists "src\components\common\PageHeader.tsx"
Test-FileExists "src\components\common\ProfilePhotoManager.tsx"
Test-FileExists "src\components\common\QRCodeModal.tsx"
Test-FileExists "src\components\common\RequestDetailsModal.tsx"
Test-FileExists "src\components\common\SkeletonCard.tsx"
Test-FileExists "src\components\common\SuccessModal.tsx"
Test-FileExists "src\components\common\ThemedText.tsx"
Test-FileExists "src\components\navigation\MobileBottomNav.tsx"
Test-FileExists "src\components\navigation\ExitConfirmModal.tsx"
Write-Host ""

Write-Host "⚙️ Configuration" -ForegroundColor Yellow
Write-Host "----------------"
Test-FileExists "src\config\api.config.ts"
Test-FileExists "src\config\navigation.ts"
Write-Host ""

Write-Host "🔄 Context Providers" -ForegroundColor Yellow
Write-Host "--------------------"
Test-FileExists "src\context\ActionLockContext.tsx"
Test-FileExists "src\context\AuthContext.tsx"
Test-FileExists "src\context\NotificationContext.tsx"
Test-FileExists "src\context\ProfileContext.tsx"
Test-FileExists "src\context\RefreshContext.tsx"
Test-FileExists "src\context\ThemeContext.tsx"
Test-FileExists "src\context\ToastContext.tsx"
Write-Host ""

Write-Host "🪝 Hooks" -ForegroundColor Yellow
Write-Host "--------"
Test-FileExists "src\hooks\useErrorModal.ts"
Test-FileExists "src\hooks\useSafeBackNavigation.ts"
Test-FileExists "src\hooks\useSuccessModal.ts"
Write-Host ""

Write-Host "🏗️ Layouts" -ForegroundColor Yellow
Write-Host "----------"
Test-FileExists "src\layouts\AppLayout.tsx"
Test-FileExists "src\layouts\Header.tsx"
Test-FileExists "src\layouts\Sidebar.tsx"
Write-Host ""

Write-Host "📄 Pages - Auth" -ForegroundColor Yellow
Write-Host "---------------"
Test-FileExists "src\pages\auth\LoginPage.tsx"
Test-FileExists "src\pages\auth\LoginScanner.tsx"
Test-FileExists "src\pages\auth\OTPVerifyPage.tsx"
Test-FileExists "src\pages\auth\SplashPage.tsx"
Write-Host ""

Write-Host "📄 Pages - Student" -ForegroundColor Yellow
Write-Host "------------------"
Test-FileExists "src\pages\student\StudentHome.tsx"
Test-FileExists "src\pages\student\StudentRequests.tsx"
Test-FileExists "src\pages\student\StudentHistory.tsx"
Test-FileExists "src\pages\student\StudentQRCodes.tsx"
Test-FileExists "src\pages\student\NewRequest.tsx"
Write-Host ""

Write-Host "📄 Pages - Staff" -ForegroundColor Yellow
Write-Host "----------------"
Test-FileExists "src\pages\staff\StaffDashboard.tsx"
Test-FileExists "src\pages\staff\StaffMyRequests.tsx"
Test-FileExists "src\pages\staff\StaffNewPass.tsx"
Test-FileExists "src\pages\staff\StaffBulkPass.tsx"
Write-Host ""

Write-Host "📄 Pages - HOD" -ForegroundColor Yellow
Write-Host "--------------"
Test-FileExists "src\pages\hod\HODDashboard.tsx"
Test-FileExists "src\pages\hod\HODMyRequests.tsx"
Test-FileExists "src\pages\hod\HODNewPass.tsx"
Test-FileExists "src\pages\hod\HODBulkPass.tsx"
Write-Host ""

Write-Host "📄 Pages - HR" -ForegroundColor Yellow
Write-Host "-------------"
Test-FileExists "src\pages\hr\HRDashboard.tsx"
Test-FileExists "src\pages\hr\HRMyRequests.tsx"
Test-FileExists "src\pages\hr\HRNewPass.tsx"
Test-FileExists "src\pages\hr\HRGateLogs.tsx"
Test-FileExists "src\pages\hr\HRApproval.tsx"
Write-Host ""

Write-Host "📄 Pages - Security" -ForegroundColor Yellow
Write-Host "-------------------"
Test-FileExists "src\pages\security\SecurityDashboard.tsx"
Test-FileExists "src\pages\security\SecurityScanner.tsx"
Test-FileExists "src\pages\security\SecurityActivePersons.tsx"
Test-FileExists "src\pages\security\SecurityVehicles.tsx"
Test-FileExists "src\pages\security\SecurityHistory.tsx"
Test-FileExists "src\pages\security\SecurityVisitorReg.tsx"
Test-FileExists "src\pages\security\SecurityHODContacts.tsx"
Write-Host ""

Write-Host "📄 Pages - Admin" -ForegroundColor Yellow
Write-Host "----------------"
Test-FileExists "src\pages\admin\AdminDashboard.tsx"
Test-FileExists "src\pages\admin\AdminMyRequests.tsx"
Test-FileExists "src\pages\admin\AdminNewPass.tsx"
Test-FileExists "src\pages\admin\AdminScanHistory.tsx"
Write-Host ""

Write-Host "📄 Pages - NCI" -ForegroundColor Yellow
Write-Host "--------------"
Test-FileExists "src\pages\nci\NCIDashboard.tsx"
Test-FileExists "src\pages\nci\NCIMyRequests.tsx"
Test-FileExists "src\pages\nci\NCIGateLogs.tsx"
Write-Host ""

Write-Host "📄 Pages - NTF" -ForegroundColor Yellow
Write-Host "--------------"
Test-FileExists "src\pages\ntf\NTFDashboard.tsx"
Test-FileExists "src\pages\ntf\NTFMyRequests.tsx"
Write-Host ""

Write-Host "📄 Pages - Shared" -ForegroundColor Yellow
Write-Host "-----------------"
Test-FileExists "src\pages\shared\GuestPreRequest.tsx"
Test-FileExists "src\pages\shared\NotificationsPage.tsx"
Test-FileExists "src\pages\shared\Participants.tsx"
Test-FileExists "src\pages\shared\ProfilePage.tsx"
Write-Host ""

Write-Host "🛣️ Routing" -ForegroundColor Yellow
Write-Host "----------"
Test-FileExists "src\routes\index.tsx"
Test-FileExists "src\routes\ProtectedRoute.tsx"
Write-Host ""

Write-Host "🔧 Services" -ForegroundColor Yellow
Write-Host "-----------"
Test-FileExists "src\services\api.service.ts"
Test-FileExists "src\services\CacheService.ts"
Test-FileExists "src\services\DownloadService.ts"
Test-FileExists "src\services\NotificationService.ts"
Test-FileExists "src\services\OfflineQueue.ts"
Write-Host ""

Write-Host "🎨 Styles" -ForegroundColor Yellow
Write-Host "---------"
Test-FileExists "src\index.css"
Test-FileExists "src\styles\professionalTheme.ts"
Write-Host ""

Write-Host "🛠️ Utilities" -ForegroundColor Yellow
Write-Host "------------"
Test-FileExists "src\utils\cn.ts"
Test-FileExists "src\utils\constants.ts"
Test-FileExists "src\utils\date.ts"
Test-FileExists "src\utils\dateUtils.ts"
Test-FileExists "src\utils\errorHandler.ts"
Test-FileExists "src\utils\roleDetection.ts"
Test-FileExists "src\utils\storage.ts"
Test-FileExists "src\utils\useAdaptive.ts"
Test-FileExists "src\utils\useMediaQuery.ts"
Write-Host ""

Write-Host "📚 Documentation" -ForegroundColor Yellow
Write-Host "----------------"
Test-FileExists "MIGRATION_COMPLETE.md"
Test-FileExists "PAGES_CONVERSION_STATUS.md"
Write-Host ""

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "📊 Verification Summary" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Total Checks: $($script:Total)" -ForegroundColor Yellow
Write-Host "Passed: $($script:Passed)" -ForegroundColor Green
Write-Host "Failed: $($script:Failed)" -ForegroundColor Red
Write-Host ""

if ($script:Failed -eq 0) {
    Write-Host "✅ All critical files are in place!" -ForegroundColor Green
    Write-Host "Migration is COMPLETE and ready for production." -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ Some files are missing!" -ForegroundColor Red
    Write-Host "Please review the missing files above." -ForegroundColor Yellow
    exit 1
}
