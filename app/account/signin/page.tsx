import { Suspense } from 'react'
import SignIn from '../../../views/SignIn'
import { PageLoader } from '../../../components/ui/PageLoader'

export default function Page() {
  return (
    <Suspense fallback={<PageLoader />}>
      <SignIn />
    </Suspense>
  )
}
