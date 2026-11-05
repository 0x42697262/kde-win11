#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/../.." && pwd)"
packages="$root/packages"
work="$(mktemp -d)"
export HOME="$work/home"
export XDG_DATA_HOME="$HOME/.local/share"
export XDG_RUNTIME_DIR="$work/runtime"
export QT_QPA_PLATFORM=offscreen
mkdir -p "$XDG_DATA_HOME" "$XDG_RUNTIME_DIR"
chmod 700 "$XDG_RUNTIME_DIR"
qml_tool="$(command -v qml6 || echo /usr/lib/qt6/bin/qml)"
qml_errors='error|Error|is not a type|is not installed|ReferenceError|TypeError|Cannot assign|Unable to assign|failed to load'

echo "== xmllint every SVG"
find "$packages" -name '*.svg' -type f -print0 | xargs -0 -n 200 xmllint --noout

echo "== install packages with kpackagetool6"
for package in "$packages"/plasma/look-and-feel/*/; do
    kpackagetool6 --type Plasma/LookAndFeel --install "$package"
done
for package in "$packages"/plasma/desktoptheme/*/; do
    kpackagetool6 --type Plasma/Theme --install "$package"
done
kpackagetool6 --type Wallpaper/Images --install "$packages/wallpapers/kde-win11"
kpackagetool6 --type Plasma/LookAndFeel --list | tee "$work/lookandfeel.txt"
grep -q 'com.github.0x42697262.kdewin11.light' "$work/lookandfeel.txt"
grep -q 'com.github.0x42697262.kdewin11.dark' "$work/lookandfeel.txt"

echo "== load the splash screens"
for splash in "$packages"/plasma/look-and-feel/*/contents/splash/Splash.qml; do
    timeout 5 "$qml_tool" "$splash" >"$work/splash.log" 2>&1 || true
    cat "$work/splash.log"
    if grep -E "$qml_errors" "$work/splash.log"; then
        echo "splash failed: $splash"
        exit 1
    fi
done

echo "kde-check: all packages installed and loaded"
