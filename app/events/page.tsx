import { Suspense } from 'react'
import Events from '../../views/Events'
import { PageLoader } from '../../components/ui/PageLoader'

export default function Page() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Events />
    </Suspense>
  )
}
