import { readFileSync } from "node:fs";
import { join } from "node:path";

export const QML_SOURCE_FILES = Object.freeze({
    splash: "src/qml/splash/Splash.qml",
    login: "src/qml/sddm/Main.qml",
});

/**
 * @param {string} root
 * @returns {import("../domain/kde/assemble.mjs").StaticSources}
 */
export function loadQmlSources(root) {
    /**
     * @param {string} path
     * @returns {string}
     */
    const read = (path) => {
        try {
            return readFileSync(join(root, path), "utf8");
        } catch (error) {
            return error instanceof Error ? "" : String(error);
        }
    };
    return { splashQml: read(QML_SOURCE_FILES.splash), loginQml: read(QML_SOURCE_FILES.login) };
}
