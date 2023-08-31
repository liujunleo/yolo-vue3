export const extend = Object.assign

export const isObject = (val) => {
    return val !== null && typeof(val) === 'object'
}

export const hasChanged = (value, newValue) => {
    return !Object.is(value, newValue)
}

export const isOn = (key: string) => {
    return /^on[A-z]/.test(key)
}

export const getEventNameByKey = (key: string) => {
    return key.slice(2).toLocaleLowerCase()
}

export const hasOwn = (target, key) => Object.prototype.hasOwnProperty.call(target, key)

// 首字母大写
export function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

// 将 event 转化成组件中的命名格式，event -> onEvent、event-name -> onEventName
export function toHandleKey(str: string) {
    return str ? `on${capitalize(str)}`: ''
}

// 去除-以及转换-后首字母为大写
export function camelize(str: string) {
    return str.replace(/-(\w)/g, (rule, v) => {
        return v ? v.toUpperCase() : ''
    })
}