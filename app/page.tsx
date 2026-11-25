import { Suspense } from 'react'
import Home from '../views/Home'
import { PageLoader } from '../components/ui/PageLoader'

export default function Page() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Home />
    </Suspense>
  )
}
