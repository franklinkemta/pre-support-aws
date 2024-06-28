import React from 'react'
import { Button } from '@headlessui/react'
import Typewriter from 'typewriter-effect'

import useDialogAPI from '@/func/useDialogAPI'

import './styles.css'

const Assitant: React.FC = () => {
  const { isRecording, toggleListening, setTypeWriter } = useDialogAPI();

  return (
    <div className="flex flex-col justify-center align-middle items-center place-items-center h-[300px] mt-7 text-white">
      <a onClick={toggleListening} href="#" className="ripple-effect assistant-active flex justify-center align-middle place-items-center rounded-full h-40 w-40 border-8 border-[white] bg-[var(--color-1)]">
        <span className="text-4xl"></span>
      </a>

      <div className="flex mt-7 text-white">
        <Typewriter onInit={(typewriter) => setTypeWriter(typewriter) } options={{cursor: '', loop: false, delay: 7, wrapperClassName: 'flex animate-pulse text-lg min-h-7'}} />
      </div>
        
      
      <div className="flex flex-col w-full fixed bottom-0 p-2 text-white" >
        <div className="invisible inline-flex justify-center">
          <Button 
            onClick={toggleListening} disabled={!isRecording}
            className="ripple-effect rounded-full border-2 border-white py-2 px-3 text-md font-bold text-white">
            ⬜️
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Assitant