pragma ComponentBehavior: Bound
import QtQuick
import QtQuick.Shapes

Rectangle {
    id: root

    property int stage
    readonly property Tokens tokens: Tokens {}

    color: tokens.background

    Item {
        id: content

        anchors.centerIn: parent
        width: root.tokens.logoSize
        height: root.tokens.logoSize + root.tokens.ringGap + root.tokens.ringSize
        opacity: 0

        Image {
            id: logo

            anchors.top: parent.top
            anchors.horizontalCenter: parent.horizontalCenter
            width: root.tokens.logoSize
            height: root.tokens.logoSize
            sourceSize.width: root.tokens.logoSize
            sourceSize.height: root.tokens.logoSize
            source: root.tokens.logoSource
            smooth: true
        }

        Shape {
            id: ring

            anchors.bottom: parent.bottom
            anchors.horizontalCenter: parent.horizontalCenter
            width: root.tokens.ringSize
            height: root.tokens.ringSize
            preferredRendererType: Shape.CurveRenderer

            ShapePath {
                strokeColor: root.tokens.accent
                strokeWidth: root.tokens.ringStroke
                fillColor: root.tokens.transparent
                capStyle: ShapePath.RoundCap

                PathAngleArc {
                    centerX: ring.width / 2
                    centerY: ring.height / 2
                    radiusX: (ring.width - root.tokens.ringStroke) / 2
                    radiusY: (ring.height - root.tokens.ringStroke) / 2
                    startAngle: 0
                    sweepAngle: root.tokens.ringSweep
                }
            }

            RotationAnimator on rotation {
                from: 0
                to: root.tokens.fullTurn
                duration: root.tokens.spinMilliseconds
                loops: Animation.Infinite
                running: true
            }
        }
    }

    OpacityAnimator {
        id: introAnimation

        target: content
        from: 0
        to: 1
        duration: root.tokens.fadeMilliseconds
        easing.type: Easing.OutCubic
    }

    onStageChanged: {
        if (root.stage === root.tokens.introStage) {
            introAnimation.running = true;
        }
    }
}
