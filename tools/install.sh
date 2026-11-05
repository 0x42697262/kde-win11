#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
data_home="${XDG_DATA_HOME:-$HOME/.local/share}"
config_home="${XDG_CONFIG_HOME:-$HOME/.config}"
settings="$config_home/kde-win11/settings.json"
sddm_themes="/usr/share/sddm/themes"
sddm_config="/etc/sddm.conf.d/kde-win11.conf"
source_dir="$root/packages"
variant=""
apply=1
layout=1
sddm=0
uninstall=0

usage() {
    cat <<'USAGE'
Usage: tools/install.sh [options]

Copies the Windows 11 theme into $XDG_DATA_HOME and applies it.

  --light          Apply the light global theme
  --dark           Apply the dark global theme
  --keep-layout    Apply colors, icons and decorations but keep your panels
  --no-apply       Only copy the files
  --sddm           Also install and select the login screen (uses sudo)
  --uninstall      Remove everything this script installed
  -h, --help       Show this help

If $XDG_CONFIG_HOME/kde-win11/settings.json exists and Node is installed,
the theme is rebuilt with your settings first.
USAGE
}

while [ "$#" -gt 0 ]; do
    case "$1" in
        --light) variant="light" ;;
        --dark) variant="dark" ;;
        --keep-layout) layout=0 ;;
        --no-apply) apply=0 ;;
        --sddm) sddm=1 ;;
        --uninstall) uninstall=1 ;;
        -h | --help) usage; exit 0 ;;
        *) echo "Unknown option: $1" >&2; usage >&2; exit 2 ;;
    esac
    shift
done

run_if_present() {
    if command -v "$1" >/dev/null 2>&1; then
        "$@" || echo "warning: $1 failed" >&2
    else
        echo "skip: $1 not found" >&2
    fi
}

if [ -f "$settings" ] && command -v node >/dev/null 2>&1 && [ "$uninstall" -eq 0 ]; then
    build_dir="$(mktemp -d)"
    trap 'rm -rf "$build_dir"' EXIT
    node "$root/tools/build.mjs" --settings "$settings" --out "$build_dir"
    source_dir="$build_dir"
fi

# shellcheck source=/dev/null
. "$source_dir/manifest.env"

if [ "$uninstall" -eq 1 ]; then
    for path in $KDE_WIN11_PATHS; do
        rm -rf "${data_home:?}/$path"
        echo "removed $data_home/$path"
    done
    if [ -d "$sddm_themes/$KDE_WIN11_SDDM_THEME" ] || [ -f "$sddm_config" ]; then
        sudo rm -rf "${sddm_themes:?}/$KDE_WIN11_SDDM_THEME" "$sddm_config"
        echo "removed the login screen"
    fi
    echo "kde-win11 removed. Pick another global theme in System Settings."
    exit 0
fi

for path in $KDE_WIN11_PATHS; do
    target="$data_home/$path"
    mkdir -p "$(dirname "$target")"
    rm -rf "$target"
    cp -a "$source_dir/$path" "$target"
    echo "installed $target"
done

if [ "$sddm" -eq 1 ]; then
    sudo install -d "$sddm_themes" "$(dirname "$sddm_config")"
    sudo rm -rf "${sddm_themes:?}/$KDE_WIN11_SDDM_THEME"
    sudo cp -a "$source_dir/$KDE_WIN11_SDDM_PATH" "$sddm_themes/"
    printf '[Theme]\nCurrent=%s\n' "$KDE_WIN11_SDDM_THEME" | sudo tee "$sddm_config" >/dev/null
    echo "installed the login screen; preview it with: sddm-greeter-qt6 --test-mode --theme $sddm_themes/$KDE_WIN11_SDDM_THEME"
fi

if [ "$apply" -eq 0 ]; then
    exit 0
fi

variant="${variant:-$KDE_WIN11_DEFAULT_VARIANT}"
suffix="$(printf '%s' "$variant" | tr '[:lower:]' '[:upper:]')"
look_and_feel_var="KDE_WIN11_LOOK_AND_FEEL_$suffix"
color_scheme_var="KDE_WIN11_COLOR_SCHEME_$suffix"
desktop_theme_var="KDE_WIN11_DESKTOP_THEME_$suffix"
cursor_theme_var="KDE_WIN11_CURSOR_THEME_$suffix"
decoration_var="KDE_WIN11_DECORATION_THEME_$suffix"

if [ "$layout" -eq 1 ]; then
    run_if_present plasma-apply-lookandfeel --apply "${!look_and_feel_var}" --resetLayout
else
    run_if_present plasma-apply-lookandfeel --apply "${!look_and_feel_var}"
fi
run_if_present plasma-apply-colorscheme "${!color_scheme_var}"
run_if_present plasma-apply-desktoptheme "${!desktop_theme_var}"
run_if_present plasma-apply-cursortheme --size "$KDE_WIN11_CURSOR_SIZE" "${!cursor_theme_var}"
run_if_present plasma-apply-wallpaperimage "$data_home/$KDE_WIN11_WALLPAPER"
run_if_present kwriteconfig6 --file kwinrc --group org.kde.kdecoration2 --key library "$KDE_WIN11_DECORATION_LIBRARY"
run_if_present kwriteconfig6 --file kwinrc --group org.kde.kdecoration2 --key theme "${!decoration_var}"
run_if_present kwriteconfig6 --file kwinrc --group org.kde.kdecoration2 --key ButtonsOnLeft "$KDE_WIN11_BUTTONS_LEFT"
run_if_present kwriteconfig6 --file kwinrc --group org.kde.kdecoration2 --key ButtonsOnRight "$KDE_WIN11_BUTTONS_RIGHT"
run_if_present dbus-send --session --type=signal /KWin org.kde.KWin.reloadConfig
echo "kde-win11 $variant applied."
