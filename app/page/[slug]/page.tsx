import { Suspense } from 'react'
import StaticPage from '../../../views/StaticPage'
import { PageLoader } from '../../../components/ui/PageLoader'

export default function Page() {
  return (
    <Suspense fallback={<PageLoader />}>
      <StaticPage />
    </Suspense>
  )
}
