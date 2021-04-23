export default function parseMeta(script) {
    return script
        .slice(script.indexOf('==UserScript=='), script.indexOf('==/UserScript=='))
        .split('\n')
        .map(line => line.match(/^\s*[\/]{2,}\s*@(\S+)\s+(.+)/i))
        .filter(match => !!match)
        .reduce((result, [, key, value]) => {
            if (Object.keys(result).includes(key)) {
                if (Array.isArray(result[key])) {
                    result[key].push(value);
                } else {
                    result[key] = [result[key], value];
                }
            } else {
                result[key] = value;
            }
            return result;
        }, {});
}