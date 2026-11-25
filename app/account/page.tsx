import { Suspense } from 'react'
import Account from '../../views/Account'
import { PageLoader } from '../../components/ui/PageLoader'

export default function Page() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Account />
    </Suspense>
  )
}
