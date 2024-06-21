import React from 'react'

import AssistantToggle from '@/components/AssistantToggle'
import Layout from '@/components/Layout'


function DemoLayout() {
  return (
    <div className="layout">
        <Layout visible>
          <>Hi</>
        </Layout>
        <AssistantToggle />
    </div>
  )
}

export default DemoLayout
