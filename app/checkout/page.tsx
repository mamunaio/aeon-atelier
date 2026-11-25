import { Suspense } from 'react'
import Checkout from '../../views/Checkout'
import { PageLoader } from '../../components/ui/PageLoader'

export default function Page() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Checkout />
    </Suspense>
  )
}
