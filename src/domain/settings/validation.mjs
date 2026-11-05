import { SettingType } from "./definitions.mjs";

const HEX_COLOR_PATTERN = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

export const ValidationProblem = Object.freeze({
    WrongType: "wrongType",
    OutOfRange: "outOfRange",
    NotAnOption: "notAnOption",
    NotAColor: "notAColor",
    UnknownKey: "unknownKey",
    UnreadableDocument: "unreadableDocument",
    NewerSchemaVersion: "newerSchemaVersion",
});

/** @typedef {import("./definitions.mjs").SettingDefinition} SettingDefinition */
/** @typedef {import("./definitions.mjs").SettingValue} SettingValue */
/** @typedef {typeof ValidationProblem[keyof typeof ValidationProblem]} ValidationProblemName */
/** @typedef {{ valid: true, value: SettingValue } | { valid: false, problem: ValidationProblemName }} ValidationResult */

/**
 * @param {SettingDefinition} definition
 * @param {number} value
 * @returns {boolean}
 */
function inRange(definition, value) {
    const belowMinimum = definition.minimum !== undefined && value < definition.minimum;
    const aboveMaximum = definition.maximum !== undefined && value > definition.maximum;
    return !belowMinimum && !aboveMaximum;
}

/**
 * @param {SettingDefinition} definition
 * @param {unknown} value
 * @returns {ValidationResult}
 */
export function validateValue(definition, value) {
    switch (definition.type) {
    case SettingType.Boolean:
        return typeof value === "boolean" ? { valid: true, value } : { valid: false, problem: ValidationProblem.WrongType };
    case SettingType.Number:
        if (typeof value !== "number" || !Number.isFinite(value)) {
            return { valid: false, problem: ValidationProblem.WrongType };
        }
        return inRange(definition, value) ? { valid: true, value } : { valid: false, problem: ValidationProblem.OutOfRange };
    case SettingType.String:
        return typeof value === "string" ? { valid: true, value } : { valid: false, problem: ValidationProblem.WrongType };
    case SettingType.Enum:
        if (typeof value !== "string") {
            return { valid: false, problem: ValidationProblem.WrongType };
        }
        return (definition.options ?? []).includes(value) ? { valid: true, value } : { valid: false, problem: ValidationProblem.NotAnOption };
    case SettingType.Color:
        if (typeof value !== "string") {
            return { valid: false, problem: ValidationProblem.WrongType };
        }
        return HEX_COLOR_PATTERN.test(value) ? { valid: true, value: value.toLowerCase() } : { valid: false, problem: ValidationProblem.NotAColor };
    case SettingType.List:
        return Array.isArray(value) && value.every((item) => typeof item === "string")
            ? { valid: true, value: value.slice() }
            : { valid: false, problem: ValidationProblem.WrongType };
    case SettingType.NumberList:
        if (!Array.isArray(value) || value.length === 0 || !value.every((item) => typeof item === "number" && Number.isInteger(item))) {
            return { valid: false, problem: ValidationProblem.WrongType };
        }
        return value.every((item) => inRange(definition, item)) ? { valid: true, value: value.slice() } : { valid: false, problem: ValidationProblem.OutOfRange };
    default:
        return { valid: false, problem: ValidationProblem.WrongType };
    }
}
