import { PiggyBank } from 'lucide-react'
import React from 'react'

function Logo() {
  return (
    <a href='/' className='flex items-center gap-2'>
        <PiggyBank className='stroke h-11 w-11 stroke-green-500 stroke-[1.5]' />
        <p className='bg-gradient-to-r 
        from-green-400 
        to-green-600 bg-clip-text text-3xl font-bold leading-tight tracking-tighter text-transparent'>
            OrçaSmart
        </p>
    </a>
  )
}

export default Logo
