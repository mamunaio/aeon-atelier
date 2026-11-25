import { Suspense } from 'react'
import Customize from '../../views/Customize'
import { PageLoader } from '../../components/ui/PageLoader'

export default function Page() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Customize />
    </Suspense>
  )
}
