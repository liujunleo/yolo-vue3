import { createRenderer } from "../runtime-core/renderer";
import { getEventNameByKey, isOn } from "../shared";

// 创建元素
function createElement(type) {
   return document.createElement(type)
}

// 处理 props
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

// 插入元素
function insert(el, parent) {
    parent.append(el)
}

// 移除元素
function remove(child) {
    const parent = child.parentNode
    if(parent) {
        parent.removeChild(child)
    }
}

// 设置元素文本内容
function setElementText(el, text) {
    el.textContent = text
}

const renderer: any = createRenderer({ createElement, patchProp, insert, remove, setElementText })

export function createApp(...args) {
    return renderer.createApp(...args)
}

export * from '../runtime-core'