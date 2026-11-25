import { Suspense } from 'react'
import Wishlist from '../../views/Wishlist'
import { PageLoader } from '../../components/ui/PageLoader'

export default function Page() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Wishlist />
    </Suspense>
  )
}
