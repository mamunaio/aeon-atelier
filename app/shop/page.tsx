import { Suspense } from 'react'
import Shop from '../../views/Shop'
import { PageLoader } from '../../components/ui/PageLoader'

export default function Page() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Shop />
    </Suspense>
  )
}
