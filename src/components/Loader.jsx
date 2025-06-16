import React from 'react'
import '../loader.css'
import { useTheme } from './ThemeProvider'
import { SlSocialSkype } from 'react-icons/sl'


const Loader = () => {
    const { theme } = useTheme()

    return (
        <div
            id="loader-wrapper"
            className={`flex flex-col gap-3 ${theme === 'dark' ? 'dark-mode' : 'light-mode'}`}
        >
            <div className="spinner">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>

            <div className='flex gap-3 text-4xl items-center'>
                <SlSocialSkype />
                <div className='font-bold text-3xl'>
                    Snappy
                </div>
            </div>

        </div>
    )
}

export default Loader




