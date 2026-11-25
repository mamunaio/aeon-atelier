import { Suspense } from 'react'
import OrderTracking from '../../../views/OrderTracking'
import { PageLoader } from '../../../components/ui/PageLoader'

export default function Page() {
  return (
    <Suspense fallback={<PageLoader />}>
      <OrderTracking />
    </Suspense>
  )
}
