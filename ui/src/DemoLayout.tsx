import React from 'react'


import Layout from '@/components/Layout'
import Assistant from '@/components/Assistant'
import AssistantToggle from '@/components/AssistantToggle'


function DemoLayout() {
  return (
    <div className="layout">
        <div className="h-full w-full place-content-center text-center align-middle font-bold text-3xl">
        <a href="">Contactez-nous <span className="text-[#1F0930]">↗</span></a>
        </div>
        <Layout title="Pre-support AWS - Unicorne" visible>
          <Assistant />
        </Layout>
        <AssistantToggle />
    </div>
  )
}

export default DemoLayout
