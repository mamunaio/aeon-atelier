import { Suspense } from 'react'
import Survey from '../../views/Survey'
import { PageLoader } from '../../components/ui/PageLoader'

export default function Page() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Survey />
    </Suspense>
  )
}
