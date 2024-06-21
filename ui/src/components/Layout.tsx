import React from 'react'
import { useState } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'

import './styles.css'

type LayoutProps = {
    title?: string,
    visible?: boolean,
    children: React.ReactElement,
}

function Layout({ visible = false, title, children }: LayoutProps) {
    const [isOpen, setIsOpen] = useState(visible)

    const toggle = () => setIsOpen((currentValue: boolean) => !currentValue)

    return (
        <Transition appear show={isOpen}>
            <Dialog as="div" className="relative z-10 focus:outline-none" onClose={toggle}>
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto bg-transparent">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 transform-[scale(95%)]"
                            enterTo="opacity-100 transform-[scale(100%)]"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 transform-[scale(100%)]"
                            leaveTo="opacity-0 transform-[scale(95%)]"
                        >
                            <DialogPanel className="w-full max-w-md rounded-xl bg-white/5 p-6 backdrop-blur-2xl">
                                <DialogTitle as="h3" className="text-base/7 font-medium text-white">
                                    {title}
                                </DialogTitle>
                                {children}
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

export default Layout
