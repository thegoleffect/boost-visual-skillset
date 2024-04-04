'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const Logo = dynamic(() => import('@/components/canvas/Examples').then((mod) => mod.Logo), { ssr: false })
const Visual = dynamic(() => import('@/components/canvas/Examples').then((mod) => mod.Visual), { ssr: false })
const View = dynamic(() => import('@/components/canvas/View').then((mod) => mod.View), {
  ssr: false,
  loading: () => (
    <div className='flex h-96 w-full flex-col items-center justify-center'>
      <svg className='-ml-1 mr-3 size-5 animate-spin text-black' fill='none' viewBox='0 0 24 24'>
        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
        <path
          className='opacity-75'
          fill='currentColor'
          d='M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
        />
      </svg>
    </div>
  ),
})
const Common = dynamic(() => import('@/components/canvas/View').then((mod) => mod.Common), { ssr: false })

export default function Page() {
  return (
    <>
      <div className='flex min-h-screen flex-col items-center justify-center py-2'>
        <div className='relative m-auto flex w-full flex-col flex-wrap items-center pb-[150px] md:flex-row lg:w-4/5'>
          <div className='absolute inset-0 top-28 m-auto w-96 text-7xl font-semibold'>Boost your</div>
          <div className='absolute inset-0 top-[300px] m-auto w-56 text-7xl font-semibold'>skillset</div>
          <View className='flex h-96 w-full flex-col items-center justify-center'>
            <Suspense fallback={null}>
              <Visual scale={0.125} position={[0, 0, 0]} />
              <Common />
            </Suspense>
          </View>
        </div>
      </div>
    </>
  )
}
