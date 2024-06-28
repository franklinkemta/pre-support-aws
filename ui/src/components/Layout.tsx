import React from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'

import './styles.css'

type LayoutProps = {
    title?: string,
    visible: boolean,
    onToggle: () => void,
    children: React.ReactElement,
}

function Layout({ visible, title, onToggle, children }: LayoutProps) {
    return (
        <Transition appear show={visible}>
            <Dialog as="div" className="relative z-10 focus:outline-none" onClose={onToggle}>
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto bg-[var(--color-0)]">
                    <div className="flex min-h-full items-center justify-center p-3">
                        <TransitionChild
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 transform-[scale(95%)]"
                            enterTo="opacity-100 transform-[scale(100%)]"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 transform-[scale(100%)]"
                            leaveTo="opacity-0 transform-[scale(95%)]"
                        >
                            <DialogPanel className="lg:w-2/6 w-full min-h-[60vh] h-full rounded-3xl bg-[var(--color-2)] border-4 border-[var(--color-3)] p-2 backdrop-blur-2xl">
                                <DialogTitle as="div" className="text-base/7 flex text-center justify-center font-bold text-white">
                                ✅ {title}
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
