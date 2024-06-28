import React from 'react'

import './styles.css'

import icon from '@/assets/icon.svg'

interface AssistantToggleProps {
  onToggle: () => void
  active?: boolean
}

function AssitantToggle({ onToggle, active }: AssistantToggleProps) {

  return (
    <a className="assistant" onClick={onToggle} href="#">
        <img className="assistant-icon assistant-icon-active" src={icon} alt="AssitantToggle" />
        <div className="assistant-status">
          <span className="rounded-full bg-white text-sm">
          { active ? '' : '' }
          </span>
        </div>
    </a>
  )
}

export default AssitantToggle
