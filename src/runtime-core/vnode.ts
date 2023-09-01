import { ShapeFlags } from "../shared/ShapeFlags";

export function createVNode(type, props?, children?) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
        el: null
    }

    if (typeof children === 'string') {
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
    } else if (typeof children === 'object') {
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILREN
    }

    // 如果当前 vnode，为组件且 children 为 object，设置 shapeFlag 为 SLOT_CHILDREN 标记
    if(vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        if(typeof vnode.children === 'object') {
            vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN
        }
    }

    return vnode
}

export function getShapeFlag(type) {
    return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}