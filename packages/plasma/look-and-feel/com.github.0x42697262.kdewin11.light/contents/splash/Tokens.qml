import QtQuick

QtObject {
    readonly property color background: "#f3f3f3"
    readonly property color accent: "#0066b4"
    readonly property color transparent: "transparent"
    readonly property url logoSource: "images/logo.svg"
    readonly property real logoSize: 96
    readonly property real ringSize: 40
    readonly property real ringStroke: 4
    readonly property real ringGap: 96
    readonly property real ringSweep: 270
    readonly property real fullTurn: 360
    readonly property int spinMilliseconds: 1200
    readonly property int fadeMilliseconds: 300
    readonly property int introStage: 2
}
