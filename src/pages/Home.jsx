import React from 'react'
import { Button } from '@/components/ui/button'
import { SlSocialSkype } from 'react-icons/sl'
import { Link } from 'react-router-dom'


const Home = () => {
  return (
    <div className='flex flex-col gap-8 justify-center items-center min-h-screen'>
      <div className='flex gap-2 items-center text-8xl font-bold'>
        <SlSocialSkype />
        Snappy
      </div>
      <div className='flex flex-col justify-center items-center'>
        <div className='text-2xl'> Social media next generation applicaiton </div>
        <div className='text-2xl'>Register now !!!</div>
      </div>
      <Link to={`/sign-up`}>
        <Button>Get Started</Button>
      </Link>
    </div>
  )
}

export default Home