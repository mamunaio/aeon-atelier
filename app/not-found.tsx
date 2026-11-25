import { Suspense } from 'react'
import NotFound from '../views/NotFound'
import { PageLoader } from '../components/ui/PageLoader'

export default function Page() {
  return (
    <Suspense fallback={<PageLoader />}>
      <NotFound />
    </Suspense>
  )
}
