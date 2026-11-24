import { Fragment, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { ConfirmDialogHost } from '@/components/ConfirmDialogHost'
import { CustomerSupportHost } from '@/components/CustomerSupportHost'
import { router } from '@/router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fragment>
      <RouterProvider router={router} />
      <ConfirmDialogHost />
      <CustomerSupportHost />
    </Fragment>
  </StrictMode>
)