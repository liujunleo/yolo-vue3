import { createVNode } from './vnode'
import { render } from './renderer'

export function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            const container = typeof rootContainer === 'string' ? document.querySelector(rootContainer) : rootContainer
            const vnode = createVNode(rootComponent)
            render(vnode, container)
        }
    }
}