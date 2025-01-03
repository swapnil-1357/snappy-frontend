import React from 'react'
import { ModeToggle } from './ModeToggle'


const Footer = () => {
    return (
        <div className='text-lg w-fit fixed z-100 bottom-5 right-5'>
            <ModeToggle />
        </div>
    )
}

export default Footer