#!/bin/bash

# RITGate Web Migration Verification Script
# This script verifies that all critical files are in place and properly migrated

echo "🔍 RITGate Web Migration Verification"
echo "======================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
TOTAL=0
PASSED=0
FAILED=0

# Function to check if file exists
check_file() {
    TOTAL=$((TOTAL + 1))
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗${NC} $1 ${RED}(MISSING)${NC}"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# Function to check if directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
        return 0
    else
        echo -e "${RED}✗${NC} $1/ ${RED}(MISSING)${NC}"
        return 1
    fi
}

echo "📦 Core Configuration"
echo "--------------------"
check_file "package.json"
check_file "vite.config.ts"
check_file "tsconfig.json"
check_file "index.html"
check_file "netlify.toml"
echo ""

echo "🎨 Source Structure"
echo "-------------------"
check_dir "src"
check_dir "src/assets"
check_dir "src/components"
check_dir "src/config"
check_dir "src/context"
check_dir "src/hooks"
check_dir "src/layouts"
check_dir "src/pages"
check_dir "src/routes"
check_dir "src/services"
check_dir "src/styles"
check_dir "src/types"
check_dir "src/utils"
echo ""

echo "🧩 Components"
echo "-------------"
check_file "src/components/common/BulkDetailsModal.tsx"
check_file "src/components/common/ColorPickerModal.tsx"
check_file "src/components/common/ConfirmationModal.tsx"
check_file "src/components/common/ErrorModal.tsx"
check_file "src/components/common/GatePassQRModal.tsx"
check_file "src/components/common/NotificationBell.tsx"
check_file "src/components/common/PageHeader.tsx"
check_file "src/components/common/ProfilePhotoManager.tsx"
check_file "src/components/common/QRCodeModal.tsx"
check_file "src/components/common/RequestDetailsModal.tsx"
check_file "src/components/common/SkeletonCard.tsx"
check_file "src/components/common/SuccessModal.tsx"
check_file "src/components/common/ThemedText.tsx"
check_file "src/components/navigation/MobileBottomNav.tsx"
check_file "src/components/navigation/ExitConfirmModal.tsx"
echo ""

echo "⚙️ Configuration"
echo "----------------"
check_file "src/config/api.config.ts"
check_file "src/config/navigation.ts"
echo ""

echo "🔄 Context Providers"
echo "--------------------"
check_file "src/context/ActionLockContext.tsx"
check_file "src/context/AuthContext.tsx"
check_file "src/context/NotificationContext.tsx"
check_file "src/context/ProfileContext.tsx"
check_file "src/context/RefreshContext.tsx"
check_file "src/context/ThemeContext.tsx"
check_file "src/context/ToastContext.tsx"
echo ""

echo "🪝 Hooks"
echo "--------"
check_file "src/hooks/useErrorModal.ts"
check_file "src/hooks/useSafeBackNavigation.ts"
check_file "src/hooks/useSuccessModal.ts"
echo ""

echo "🏗️ Layouts"
echo "----------"
check_file "src/layouts/AppLayout.tsx"
check_file "src/layouts/Header.tsx"
check_file "src/layouts/Sidebar.tsx"
echo ""

echo "📄 Pages - Auth"
echo "---------------"
check_file "src/pages/auth/LoginPage.tsx"
check_file "src/pages/auth/LoginScanner.tsx"
check_file "src/pages/auth/OTPVerifyPage.tsx"
check_file "src/pages/auth/SplashPage.tsx"
echo ""

echo "📄 Pages - Student"
echo "------------------"
check_file "src/pages/student/StudentHome.tsx"
check_file "src/pages/student/StudentRequests.tsx"
check_file "src/pages/student/StudentHistory.tsx"
check_file "src/pages/student/StudentQRCodes.tsx"
check_file "src/pages/student/NewRequest.tsx"
echo ""

echo "📄 Pages - Staff"
echo "----------------"
check_file "src/pages/staff/StaffDashboard.tsx"
check_file "src/pages/staff/StaffMyRequests.tsx"
check_file "src/pages/staff/StaffNewPass.tsx"
check_file "src/pages/staff/StaffBulkPass.tsx"
echo ""

echo "📄 Pages - HOD"
echo "--------------"
check_file "src/pages/hod/HODDashboard.tsx"
check_file "src/pages/hod/HODMyRequests.tsx"
check_file "src/pages/hod/HODNewPass.tsx"
check_file "src/pages/hod/HODBulkPass.tsx"
echo ""

echo "📄 Pages - HR"
echo "-------------"
check_file "src/pages/hr/HRDashboard.tsx"
check_file "src/pages/hr/HRMyRequests.tsx"
check_file "src/pages/hr/HRNewPass.tsx"
check_file "src/pages/hr/HRGateLogs.tsx"
check_file "src/pages/hr/HRApproval.tsx"
echo ""

echo "📄 Pages - Security"
echo "-------------------"
check_file "src/pages/security/SecurityDashboard.tsx"
check_file "src/pages/security/SecurityScanner.tsx"
check_file "src/pages/security/SecurityActivePersons.tsx"
check_file "src/pages/security/SecurityVehicles.tsx"
check_file "src/pages/security/SecurityHistory.tsx"
check_file "src/pages/security/SecurityVisitorReg.tsx"
check_file "src/pages/security/SecurityHODContacts.tsx"
echo ""

echo "📄 Pages - Admin"
echo "----------------"
check_file "src/pages/admin/AdminDashboard.tsx"
check_file "src/pages/admin/AdminMyRequests.tsx"
check_file "src/pages/admin/AdminNewPass.tsx"
check_file "src/pages/admin/AdminScanHistory.tsx"
echo ""

echo "📄 Pages - NCI"
echo "--------------"
check_file "src/pages/nci/NCIDashboard.tsx"
check_file "src/pages/nci/NCIMyRequests.tsx"
check_file "src/pages/nci/NCIGateLogs.tsx"
echo ""

echo "📄 Pages - NTF"
echo "--------------"
check_file "src/pages/ntf/NTFDashboard.tsx"
check_file "src/pages/ntf/NTFMyRequests.tsx"
echo ""

echo "📄 Pages - Shared"
echo "-----------------"
check_file "src/pages/shared/GuestPreRequest.tsx"
check_file "src/pages/shared/NotificationsPage.tsx"
check_file "src/pages/shared/Participants.tsx"
check_file "src/pages/shared/ProfilePage.tsx"
echo ""

echo "🛣️ Routing"
echo "----------"
check_file "src/routes/index.tsx"
check_file "src/routes/ProtectedRoute.tsx"
echo ""

echo "🔧 Services"
echo "-----------"
check_file "src/services/api.service.ts"
check_file "src/services/CacheService.ts"
check_file "src/services/DownloadService.ts"
check_file "src/services/NotificationService.ts"
check_file "src/services/OfflineQueue.ts"
echo ""

echo "🎨 Styles"
echo "---------"
check_file "src/index.css"
check_file "src/styles/professionalTheme.ts"
echo ""

echo "🛠️ Utilities"
echo "------------"
check_file "src/utils/cn.ts"
check_file "src/utils/constants.ts"
check_file "src/utils/date.ts"
check_file "src/utils/dateUtils.ts"
check_file "src/utils/errorHandler.ts"
check_file "src/utils/roleDetection.ts"
check_file "src/utils/storage.ts"
check_file "src/utils/useAdaptive.ts"
check_file "src/utils/useMediaQuery.ts"
echo ""

echo "📚 Documentation"
echo "----------------"
check_file "MIGRATION_COMPLETE.md"
check_file "PAGES_CONVERSION_STATUS.md"
echo ""

echo "======================================"
echo "📊 Verification Summary"
echo "======================================"
echo -e "Total Checks: ${YELLOW}${TOTAL}${NC}"
echo -e "Passed: ${GREEN}${PASSED}${NC}"
echo -e "Failed: ${RED}${FAILED}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All critical files are in place!${NC}"
    echo -e "${GREEN}Migration is COMPLETE and ready for production.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some files are missing!${NC}"
    echo -e "${YELLOW}Please review the missing files above.${NC}"
    exit 1
fi
