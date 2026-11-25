import { Suspense } from 'react'
import Admin from '../../views/Admin'
import { PageLoader } from '../../components/ui/PageLoader'

export default function Page() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Admin />
    </Suspense>
  )
}
