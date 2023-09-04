import { ShapeFlags } from "../shared/ShapeFlags"

export function initSlots(instance: any, children: any) {

    const { vnode } = instance
    // vnode.shapeFlag 标记为 SLOT_CHILDREN 时，才执行绑定 slots 逻辑
    if( vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
        normalizeObjectSlots(children, instance.slots)
    }
}

function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        const value = children[key]
        slots[key] = (props) => normalizeSlotValue(value(props))
    }
}

function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value]
}