const MAGIC = 0x72756358;
const FILE_HEADER_SIZE = 16;
const FILE_VERSION = 0x10000;
const TOC_ENTRY_SIZE = 12;
const IMAGE_TYPE = 0xfffd0002;
const IMAGE_HEADER_SIZE = 36;
const IMAGE_VERSION = 1;
const UINT32_SIZE = 4;
const LITTLE_ENDIAN = true;

/** @typedef {import("./cursor.mjs").CursorImage} CursorImage */

/**
 * @param {readonly CursorImage[]} images
 * @returns {Uint8Array}
 */
export function encodeXcursor(images) {
    const tocSize = images.length * TOC_ENTRY_SIZE;
    const imageSizes = images.map((image) => IMAGE_HEADER_SIZE + image.width * image.height * UINT32_SIZE);
    const total = FILE_HEADER_SIZE + tocSize + imageSizes.reduce((sum, value) => sum + value, 0);
    const bytes = new Uint8Array(total);
    const view = new DataView(bytes.buffer);
    view.setUint32(0, MAGIC, LITTLE_ENDIAN);
    view.setUint32(UINT32_SIZE, FILE_HEADER_SIZE, LITTLE_ENDIAN);
    view.setUint32(UINT32_SIZE * 2, FILE_VERSION, LITTLE_ENDIAN);
    view.setUint32(UINT32_SIZE * (1 + 2), images.length, LITTLE_ENDIAN);
    let position = FILE_HEADER_SIZE + tocSize;
    images.forEach((image, index) => {
        const toc = FILE_HEADER_SIZE + index * TOC_ENTRY_SIZE;
        view.setUint32(toc, IMAGE_TYPE, LITTLE_ENDIAN);
        view.setUint32(toc + UINT32_SIZE, image.size, LITTLE_ENDIAN);
        view.setUint32(toc + UINT32_SIZE * 2, position, LITTLE_ENDIAN);
        const fields = [IMAGE_HEADER_SIZE, IMAGE_TYPE, image.size, IMAGE_VERSION, image.width, image.height, image.hotX, image.hotY, image.delay];
        fields.forEach((value, fieldIndex) => view.setUint32(position + fieldIndex * UINT32_SIZE, value, LITTLE_ENDIAN));
        let pixel = position + IMAGE_HEADER_SIZE;
        image.pixels.forEach((value) => {
            view.setUint32(pixel, value, LITTLE_ENDIAN);
            pixel += UINT32_SIZE;
        });
        position += imageSizes[index] ?? 0;
    });
    return bytes;
}

/**
 * @param {Uint8Array} bytes
 * @returns {{ size: number, width: number, height: number, hotX: number, hotY: number, delay: number, offset: number }[]}
 */
export function readXcursorDirectory(bytes) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (view.getUint32(0, LITTLE_ENDIAN) !== MAGIC) {
        throw new Error("Not an Xcursor file");
    }
    const count = view.getUint32(UINT32_SIZE * (1 + 2), LITTLE_ENDIAN);
    return Array.from({ length: count }, (_unused, index) => {
        const position = view.getUint32(FILE_HEADER_SIZE + index * TOC_ENTRY_SIZE + UINT32_SIZE * 2, LITTLE_ENDIAN);
        /**
         * @param {number} field
         * @returns {number}
         */
        const field = (field) => view.getUint32(position + field * UINT32_SIZE, LITTLE_ENDIAN);
        return { size: field(2), width: field(UINT32_SIZE), height: field(UINT32_SIZE + 1), hotX: field(UINT32_SIZE + 2), hotY: field(UINT32_SIZE + 1 + 2), delay: field(UINT32_SIZE * 2), offset: position + IMAGE_HEADER_SIZE };
    });
}
