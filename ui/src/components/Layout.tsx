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
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto bg-[#1F0930]">
                    <div className="flex min-h-full items-center justify-center p-3">
                        <TransitionChild
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 transform-[scale(95%)]"
                            enterTo="opacity-100 transform-[scale(100%)]"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 transform-[scale(100%)]"
                            leaveTo="opacity-0 transform-[scale(95%)]"
                        >
                            <DialogPanel className="lg:w-2/6 w-full min-h-[60vh] h-full rounded-xl bg-[#242F3E] border-4 border-[#D4DADA] p-2 backdrop-blur-2xl">
                                <DialogTitle as="div" className="text-base/7 flex text-center justify-center font-bold text-white">
                                ✅ {title}
                                </DialogTitle>
                                <hr />
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
