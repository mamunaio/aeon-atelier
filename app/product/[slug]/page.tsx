import { Suspense } from 'react'
import ProductPage from '../../../views/ProductPage'
import { PageLoader } from '../../../components/ui/PageLoader'

export default function Page() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ProductPage />
    </Suspense>
  )
}
