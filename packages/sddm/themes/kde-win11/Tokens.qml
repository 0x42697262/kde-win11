import QtQuick

QtObject {
    readonly property color background: "#000000"
    readonly property color dim: "#000000"
    readonly property color transparent: "transparent"
    readonly property color text: "#ffffffff"
    readonly property color textSecondary: "#ffc8c8c8"
    readonly property color accent: "#ff73b5e7"
    readonly property color error: "#ffff99a4"
    readonly property color field: "#cc2c2c2c"
    readonly property color menu: "#f52c2c2c"
    readonly property color fieldStroke: "#66757575"
    readonly property color hover: "#0fffffff"
    readonly property color pressed: "#0bffffff"
    readonly property color selection: "#0fffffff"
    readonly property color avatarBackground: "#ff2d2d2d"
    readonly property string fontFamily: "Inter"
    readonly property real clockFontSize: 96
    readonly property real dateFontSize: 24
    readonly property real nameFontSize: 28
    readonly property real bodyFontSize: 14
    readonly property real avatarSize: 192
    readonly property real smallAvatarSize: 40
    readonly property real fieldWidth: 296
    readonly property real fieldHeight: 36
    readonly property real controlRadius: 4
    readonly property real iconSize: 20
    readonly property real buttonSize: 40
    readonly property real spacing: 16
    readonly property real edgeMargin: 32
    readonly property real clockTopRatio: 0.18
    readonly property real blurAmount: 1
    readonly property real blurMax: 64
    readonly property real dimOpacity: 0.25
    readonly property real transitionMilliseconds: 250
    readonly property int clockTickMilliseconds: 1000
    readonly property string timeFormat: "h:mm"
    readonly property string dateFormat: "dddd, MMMM d"
    readonly property string passwordPlaceholder: "Password"
    readonly property string signInText: "Sign in"
    readonly property string failedText: "The password is incorrect. Try again."
    readonly property string sessionText: "Session"
    readonly property string sleepText: "Sleep"
    readonly property string restartText: "Restart"
    readonly property string shutDownText: "Shut down"
    readonly property string pressToUnlockText: "Press any key or click to sign in"
    readonly property url powerIcon: "icons/power.svg"
    readonly property url restartIcon: "icons/restart.svg"
    readonly property url sleepIcon: "icons/sleep.svg"
    readonly property url arrowIcon: "icons/arrow.svg"
    readonly property url personIcon: "icons/person.svg"
}
