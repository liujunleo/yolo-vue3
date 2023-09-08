import { createVNode } from './vnode'

export function createAppApi(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                const container = typeof rootContainer === 'string' ? document.querySelector(rootContainer) : rootContainer
                const vnode = createVNode(rootComponent)
                render(vnode, container)
            }
        }
    }
}
