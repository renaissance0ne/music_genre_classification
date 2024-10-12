import React from 'react'
import { logo } from '../assets';

const Hero = () => {
  return (
    <header className='w-full flex justify-center items-center flex-col'>
        <nav className='flex justify-between items-center w-full mb-10 pt-3'>
            <img src ={logo} alt="Music_logo"
            className='w-28 object-contain' />
        </nav>
        <button
           type='button'
           onClick={() => window.open('https://github.com/sudhanvapadki')}
           className='black_btn'
           >
            GitHub
           </button>
           <h1 className='head_text'>
            Summarize Music with <br
            className='max-md:hidden' />
            <span className='blue_gradient'>
                Sonata AI
            </span>
              

           </h1>
           <h2 className='desc'>
            Know what kind of music you are listening To!
            Just drag and drop the file below, let sonata AI do the rest!

           </h2>



    </header>
  )
}

export default Hero