export default class {
    has(target, prop) {
        if (typeof prop === "symbol") {
            return prop in target; // pass through; or 'return;' if you want to block pass through
        }
        prop = prop.toLowerCase();
        if (prop in target) return true;
        let keys = Object.keys(target);
        let i = keys.length;
        while (i--) {
            if (keys[i] && keys[i].toLowerCase() == prop) return true;
        }
        return false;
    };
    get(target, prop, receiver) {
        if (typeof prop === "symbol") {
            return target[prop];
        }
        prop = prop.toLowerCase();
        if (prop in target) return target[prop];
        let keys = Object.keys(target);
        let i = keys.length;
        while (i--) {
            if (keys[i] && keys[i].toLowerCase() == prop) return target[keys[i]];
        }
        return undefined;
    };
    set(target, prop, value) {
        if (typeof prop === "symbol") {
            target[prop] = value;
        }
        target[prop.toLowerCase()] = value;
        return true;
    }
};