import { createRenderer } from "../runtime-core/renderer";
import { getEventNameByKey, isOn } from "../shared";

function createElement(type) {
   return document.createElement(type)
}

function patchProp(el, key, prevVal, nextVal) {
    if (isOn(key)) {
        el.addEventListener(getEventNameByKey(key), nextVal)
    } else {
        if(nextVal === undefined || nextVal === null) {
            el.removeAttribute(key)
        } else {
        el.setAttribute(key, nextVal)
        }
    }
}

function insert(el, parent) {
    parent.append(el)
}

const renderer: any = createRenderer({ createElement, patchProp, insert })

export function createApp(...args) {
    return renderer.createApp(...args)
}

export * from '../runtime-core'