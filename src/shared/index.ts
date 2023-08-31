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