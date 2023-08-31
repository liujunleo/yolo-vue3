// instance 通过上层对 emit 函数 bind(null, instance) 绑定第一个参数为当前 instance
// event 事件名，通过 event 转换为事件函数命名格式（以 on 开头的驼峰命名格式），在 instance.props 中匹配对应的事件，并调用
// ...args 接收所有参数，且在调用对应事件函数时，作为回调数据传入

import { camelize, toHandleKey } from "../shared"

export function emit(instance, event, ...args) {
    const { props } = instance
    const handleName = toHandleKey(camelize(event))
    const handle = props[handleName]
    handle && handle(...args)
}

