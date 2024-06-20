import React from 'react';
import { useState } from 'react'

import './styles.css'

import icon from '@/assets/icon.svg'

function Assistant() {
  const [active, setActive] = useState(false)

  return (
    <a className="assistant" onClick={() => setActive((count) => !count)} href="#">
        <img className="assistant-icon assistant-icon-active" src={icon} alt="Assistant" />
        <div className="assistant-status">
          <span className="rounded-full bg-white text-sm">
          { active ? '' : '' }
          </span>
        </div>
    </a>
  )
}

export default Assistant
