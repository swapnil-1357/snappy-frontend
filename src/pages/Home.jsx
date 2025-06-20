import React from 'react'
import { Button } from '@/components/ui/button'
import { SlSocialSkype } from 'react-icons/sl'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className='flex flex-col gap-5 justify-center items-center min-h-screen'>
      {/* Responsive text sizes */}
      <div className='flex gap-4 items-center text-6xl md:text-8xl font-bold'>
        <SlSocialSkype />
        <div>Snappy</div>
      </div>
      <div className='flex flex-col gap-4 justify-center items-center'>
        <div className='text-lg md:text-2xl'>Social media next generation application</div>
        {/* <div className='text-lg md:text-lg italic'>Register now !!!</div> */}
        <Link to={`/sign-up`}>
          <Button>Get Started</Button>
        </Link>
      </div>

    </div>
  )
}

export default Home