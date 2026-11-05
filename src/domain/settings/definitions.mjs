export const SettingType = Object.freeze({
    Boolean: "boolean",
    Number: "number",
    String: "string",
    Enum: "enum",
    Color: "color",
    List: "list",
    NumberList: "numberList",
});

/** @typedef {typeof SettingType[keyof typeof SettingType]} SettingTypeName */
/** @typedef {boolean | number | string | string[] | number[]} SettingValue */
/**
 * @typedef {{
 *   key: string,
 *   section: string,
 *   type: SettingTypeName,
 *   defaultValue: SettingValue,
 *   description: string,
 *   options?: readonly string[],
 *   minimum?: number,
 *   maximum?: number,
 * }} SettingDefinition
 */

/**
 * @param {SettingDefinition} definition
 * @returns {Readonly<SettingDefinition>}
 */
export function defineSetting(definition) {
    return Object.freeze(definition);
}
