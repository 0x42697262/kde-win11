const INFINITY_BOUNDARY = Number.POSITIVE_INFINITY;

/**
 * @param {Float64Array} values
 * @param {number} length
 * @param {Float64Array} output
 * @param {Int32Array} parabolaSites
 * @param {Float64Array} boundaries
 */
function transformLine(values, length, output, parabolaSites, boundaries) {
    let rightmost = 0;
    parabolaSites[0] = 0;
    boundaries[0] = -INFINITY_BOUNDARY;
    boundaries[1] = INFINITY_BOUNDARY;
    for (let position = 1; position < length; position += 1) {
        let site = parabolaSites[rightmost] ?? 0;
        let crossing = ((values[position] ?? 0) + position * position - ((values[site] ?? 0) + site * site)) / (2 * position - 2 * site);
        while (crossing <= (boundaries[rightmost] ?? 0)) {
            rightmost -= 1;
            site = parabolaSites[rightmost] ?? 0;
            crossing = ((values[position] ?? 0) + position * position - ((values[site] ?? 0) + site * site)) / (2 * position - 2 * site);
        }
        rightmost += 1;
        parabolaSites[rightmost] = position;
        boundaries[rightmost] = crossing;
        boundaries[rightmost + 1] = INFINITY_BOUNDARY;
    }
    rightmost = 0;
    for (let position = 0; position < length; position += 1) {
        while ((boundaries[rightmost + 1] ?? 0) < position) {
            rightmost += 1;
        }
        const site = parabolaSites[rightmost] ?? 0;
        output[position] = (position - site) * (position - site) + (values[site] ?? 0);
    }
}

/**
 * @param {Uint8Array} inside
 * @param {number} width
 * @param {number} height
 * @param {number} infinity
 * @returns {Float64Array}
 */
export function squaredDistanceToInside(inside, width, height, infinity) {
    const distances = new Float64Array(width * height);
    for (let index = 0; index < distances.length; index += 1) {
        distances[index] = inside[index] ? 0 : infinity;
    }
    const longest = Math.max(width, height);
    const line = new Float64Array(longest);
    const output = new Float64Array(longest);
    const sites = new Int32Array(longest);
    const boundaries = new Float64Array(longest + 1);
    for (let column = 0; column < width; column += 1) {
        for (let row = 0; row < height; row += 1) {
            line[row] = distances[row * width + column] ?? infinity;
        }
        transformLine(line, height, output, sites, boundaries);
        for (let row = 0; row < height; row += 1) {
            distances[row * width + column] = output[row] ?? infinity;
        }
    }
    for (let row = 0; row < height; row += 1) {
        for (let column = 0; column < width; column += 1) {
            line[column] = distances[row * width + column] ?? infinity;
        }
        transformLine(line, width, output, sites, boundaries);
        for (let column = 0; column < width; column += 1) {
            distances[row * width + column] = output[column] ?? infinity;
        }
    }
    return distances;
}

/**
 * @param {Float64Array} channel
 * @param {number} width
 * @param {number} height
 * @param {number} radius
 * @returns {Float64Array}
 */
export function boxBlur(channel, width, height, radius) {
    if (radius <= 0) {
        return channel.slice();
    }
    const span = radius * 2 + 1;
    const horizontal = new Float64Array(width * height);
    for (let row = 0; row < height; row += 1) {
        for (let column = 0; column < width; column += 1) {
            let sum = 0;
            for (let offset = -radius; offset <= radius; offset += 1) {
                const sample = column + offset;
                sum += sample >= 0 && sample < width ? channel[row * width + sample] ?? 0 : 0;
            }
            horizontal[row * width + column] = sum / span;
        }
    }
    const result = new Float64Array(width * height);
    for (let column = 0; column < width; column += 1) {
        for (let row = 0; row < height; row += 1) {
            let sum = 0;
            for (let offset = -radius; offset <= radius; offset += 1) {
                const sample = row + offset;
                sum += sample >= 0 && sample < height ? horizontal[sample * width + column] ?? 0 : 0;
            }
            result[row * width + column] = sum / span;
        }
    }
    return result;
}
