#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
frames="${FRAMES_DIR:-$root/build/demo}"
media="$root/docs/media"
fps=20
fade=0.5
avatar="$root/packages/wallpapers/kde-win11/contents/screenshot.png"
splash="$root/packages/plasma/look-and-feel/com.github.0x42697262.kdewin11.light/contents/splash/Splash.qml"

rm -rf "$frames"
mkdir -p "$frames/login" "$frames/splash" "$media"
(cd "$root/packages/sddm/themes/kde-win11" && python3 "$root/tools/ci/qml-preview.py" login Main.qml "$frames/login/" --record --avatar "$avatar")
python3 "$root/tools/ci/qml-preview.py" splash "$splash" "$frames/splash/" --record
node "$root/tools/demo.mjs" "$frames"

seconds() {
    local count
    count="$(find "$1" -name '*.png' | wc -l)"
    echo "scale=3; $count / $fps" | bc
}
login="$(seconds "$frames/login")"
splash_length="$(seconds "$frames/splash")"
light="$(seconds "$frames/light")"
first="$(echo "$login - $fade" | bc)"
second="$(echo "$first + $splash_length - $fade" | bc)"
third="$(echo "$second + $light - $fade" | bc)"

ffmpeg -y -loglevel error \
    -framerate "$fps" -i "$frames/login/%04d.png" \
    -framerate "$fps" -i "$frames/splash/%04d.png" \
    -framerate "$fps" -i "$frames/light/%04d.png" \
    -framerate "$fps" -i "$frames/dark/%04d.png" \
    -filter_complex "[0][1]xfade=transition=fade:duration=$fade:offset=$first[a];[a][2]xfade=transition=fade:duration=$fade:offset=$second[b];[b][3]xfade=transition=fade:duration=$fade:offset=$third,format=yuv420p[v]" \
    -map "[v]" -c:v libx264 -crf 24 -preset slow -movflags +faststart "$media/demo.mp4"
ffmpeg -y -loglevel error -i "$media/demo.mp4" \
    -vf "fps=12,scale=960:-1:flags=lanczos,split[left][right];[left]palettegen=max_colors=160:stats_mode=diff[palette];[right][palette]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle" \
    "$media/demo.gif"
ls -la "$media"
