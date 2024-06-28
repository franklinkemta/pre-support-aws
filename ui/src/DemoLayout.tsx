import React, { useState } from 'react'


import Layout from '@/components/Layout'
import Assistant from '@/components/Assistant'
import AssistantToggle from '@/components/AssistantToggle'

function DemoLayout() {
  const [dialogVisible, toggleDialog] = useState(true);
  return (
    <div className="layout">
        <div className="h-full w-full place-content-center text-center align-middle font-bold text-3xl">
        <a href="">Contact-us <span className="text-[#1F0930]">↗</span></a>
        </div>
        <Layout title="Pre-support AWS - Unicorne" onToggle={() => toggleDialog((dialogVisible) => !dialogVisible)} visible={dialogVisible}>
          <Assistant />
        </Layout>
        <AssistantToggle onToggle={() => toggleDialog((dialogVisible) => !dialogVisible)} active={!dialogVisible} />
    </div>
  )
}

export default DemoLayout
