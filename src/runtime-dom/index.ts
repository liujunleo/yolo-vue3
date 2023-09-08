import { createRenderer } from "../runtime-core/renderer";
import { getEventNameByKey, isOn } from "../shared";

function createElement(type) {
   return document.createElement(type)
}

function patchProp(el, key, value) {
if (isOn(key)) {
        el.addEventListener(getEventNameByKey(key), value)
    } else {
        el.setAttribute(key, value)
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