import { Navigate, createBrowserRouter } from 'react-router-dom'
import { ShopAdminLayout } from '@/layouts/ShopAdminLayout'
import { SuperAdminLayout } from '@/layouts/SuperAdminLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
import { OtpPage } from '@/pages/auth/OtpPage'
import { SplashPage } from '@/pages/auth/SplashPage'
import { ShopDashboardPage } from '@/pages/admin/ShopDashboardPage'
import { ShopProfilePage } from '@/pages/admin/ShopProfilePage'
import { PlaceholderModulePage } from '@/pages/admin/PlaceholderModulePage'
import { InventoryModuleLayout } from '@/pages/admin/inventory/InventoryModuleLayout'
import { InventoryStocksPage } from '@/pages/admin/inventory/InventoryStocksPage'
import { InventoryBrandsPage } from '@/pages/admin/inventory/InventoryBrandsPage'
import { InventoryCategoriesPage } from '@/pages/admin/inventory/InventoryCategoriesPage'
import { InventoryVariantsPage } from '@/pages/admin/inventory/InventoryVariantsPage'
import { InventoryVariantDetailPage } from '@/pages/admin/inventory/InventoryVariantDetailPage'
import { InventoryBatchesPage } from '@/pages/admin/inventory/InventoryBatchesPage'
import { InventoryMovementsPage } from '@/pages/admin/inventory/InventoryMovementsPage'
import { InventoryAdjustmentPage } from '@/pages/admin/inventory/InventoryAdjustmentPage'
import { SuperDashboardPage } from '@/pages/super/SuperDashboardPage'
import { SuperShopsPage } from '@/pages/super/SuperShopsPage'
import { SuperUsersPage } from '@/pages/super/SuperUsersPage'
import { AuthGuard } from '@/router/AuthGuard'

const module = (title: string, description: string) => (
  <PlaceholderModulePage title={title} description={description} />
)

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/auth/login" replace /> },
  { path: '/auth/login', element: <LoginPage /> },
  { path: '/auth/forgot', element: <ForgotPasswordPage /> },
  { path: '/auth/reset', element: <ResetPasswordPage /> },
  { path: '/auth/otp', element: <OtpPage /> },
  { path: '/auth/splash', element: <SplashPage /> },
  {
    path: '/admin',
    element: <AuthGuard role="shop_admin" />,
    children: [
      {
        element: <ShopAdminLayout />,
        children: [
          { index: true, element: <ShopDashboardPage /> },
          { path: 'profile', element: <ShopProfilePage /> },
          {
            path: 'inventory',
            element: <InventoryModuleLayout />,
            children: [
              { index: true, element: <InventoryStocksPage /> },
              { path: 'brands', element: <InventoryBrandsPage /> },
              { path: 'categories', element: <InventoryCategoriesPage /> },
              { path: 'variants', element: <InventoryVariantsPage /> },
              { path: 'variants/:variantId', element: <InventoryVariantDetailPage /> },
              { path: 'batches', element: <InventoryBatchesPage /> },
              { path: 'movements', element: <InventoryMovementsPage /> },
              { path: 'adjustments/new', element: <InventoryAdjustmentPage /> },
            ],
          },
          {
            path: 'pos',
            element: module('Billing & POS', 'Counter billing for walk-in and contractors.'),
          },
          {
            path: 'suppliers',
            element: module('Suppliers', 'Berger, Asian Paints, and local hardware distributors.'),
          },
          {
            path: 'rentals',
            element: module(
              'Equipment rental',
              'Scaffolding, mixers, and tools — out / return tracking.'
            ),
          },
          {
            path: 'projects',
            element: module('Site projects', 'Painting and construction job tracking.'),
          },
          {
            path: 'reports',
            element: module('Reports', 'Sales, rental utilisation, and stock ageing.'),
          },
          {
            path: 'staff',
            element: module('Staff', 'Roles for counter, yard, and site teams.'),
          },
        ],
      },
    ],
  },
  {
    path: '/super',
    element: <AuthGuard role="super_admin" />,
    children: [
      {
        element: <SuperAdminLayout />,
        children: [
          { index: true, element: <SuperDashboardPage /> },
          { path: 'shops', element: <SuperShopsPage /> },
          { path: 'users', element: <SuperUsersPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/auth/login" replace /> },
])