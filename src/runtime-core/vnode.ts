import { ShapeFlags } from "../shared/ShapeFlags";

export function createVNode(type, props?, children?) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
        el: null
    }

    if(typeof children === 'string') {
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
    } else if(typeof children === 'object') {
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILREN
    }

    return vnode
}

export function getShapeFlag(type) {
    return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}