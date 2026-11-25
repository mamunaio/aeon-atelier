import { Suspense } from 'react'
import Cart from '../../views/Cart'
import { PageLoader } from '../../components/ui/PageLoader'

export default function Page() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Cart />
    </Suspense>
  )
}
