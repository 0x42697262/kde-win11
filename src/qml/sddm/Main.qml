pragma ComponentBehavior: Bound
import QtQuick
import QtQuick.Controls.Basic
import QtQuick.Effects

Rectangle {
    id: root

    readonly property Tokens tokens: Tokens {}
    readonly property UserEntry currentUser: users.currentItem as UserEntry
    property bool signInVisible: false
    property int sessionIndex: sessionModel.lastIndex >= 0 ? sessionModel.lastIndex : 0
    property string errorText: ""
    property date now: new Date()

    function showSignIn(): void {
        root.signInVisible = true;
        password.forceActiveFocus();
    }

    function login(): void {
        if (!root.currentUser) {
            return;
        }
        root.errorText = "";
        sddm.login(root.currentUser.name, password.text, root.sessionIndex);
    }

    component UserEntry: Rectangle {
        id: entry

        required property int index
        required property string name
        required property string realName
        required property string icon
        readonly property string displayName: entry.realName !== "" ? entry.realName : entry.name

        width: ListView.view ? ListView.view.width : 0
        height: root.tokens.smallAvatarSize + root.tokens.spacing
        radius: root.tokens.controlRadius
        color: ListView.isCurrentItem ? root.tokens.selection : entryMouse.containsMouse ? root.tokens.hover : root.tokens.transparent

        Row {
            anchors.verticalCenter: parent.verticalCenter
            anchors.left: parent.left
            anchors.leftMargin: root.tokens.spacing / 2
            spacing: root.tokens.spacing

            Avatar {
                size: root.tokens.smallAvatarSize
                source: entry.icon
            }

            Text {
                anchors.verticalCenter: parent.verticalCenter
                text: entry.displayName
                color: root.tokens.text
                font.family: root.tokens.fontFamily
                font.pixelSize: root.tokens.bodyFontSize
            }
        }

        MouseArea {
            id: entryMouse

            anchors.fill: parent
            hoverEnabled: true
            onClicked: {
                users.currentIndex = entry.index;
                root.showSignIn();
            }
        }
    }

    component Avatar: Item {
        id: avatar

        required property real size
        required property string source

        width: avatar.size
        height: avatar.size

        Rectangle {
            anchors.fill: parent
            radius: width / 2
            color: root.tokens.avatarBackground

            Image {
                anchors.centerIn: parent
                width: parent.width / 2
                height: parent.height / 2
                sourceSize.width: width
                sourceSize.height: height
                source: root.tokens.personIcon
            }
        }

        Image {
            id: picture

            anchors.fill: parent
            source: avatar.source
            sourceSize.width: avatar.size
            sourceSize.height: avatar.size
            fillMode: Image.PreserveAspectCrop
            visible: false
        }

        Item {
            id: pictureMask

            anchors.fill: parent
            layer.enabled: true
            visible: false

            Rectangle {
                anchors.fill: parent
                radius: width / 2
            }
        }

        MultiEffect {
            anchors.fill: parent
            source: picture
            maskEnabled: true
            maskSource: pictureMask
            visible: picture.status === Image.Ready
        }
    }

    component IconButton: AbstractButton {
        id: button

        required property url iconSource
        required property string label

        width: root.tokens.buttonSize
        height: root.tokens.buttonSize
        hoverEnabled: true
        ToolTip.visible: button.hovered
        ToolTip.text: button.label
        Accessible.name: button.label

        background: Rectangle {
            radius: root.tokens.controlRadius
            color: button.pressed ? root.tokens.pressed : button.hovered ? root.tokens.hover : root.tokens.transparent
        }

        contentItem: Item {
            Image {
                anchors.centerIn: parent
                width: root.tokens.iconSize
                height: root.tokens.iconSize
                sourceSize.width: root.tokens.iconSize
                sourceSize.height: root.tokens.iconSize
                source: button.iconSource
            }
        }
    }

    color: root.tokens.background
    focus: true

    Keys.onPressed: (event) => {
        if (!root.signInVisible) {
            root.showSignIn();
            event.accepted = true;
        } else if (event.key === Qt.Key_Escape) {
            root.signInVisible = false;
            root.forceActiveFocus();
            event.accepted = true;
        }
    }

    Timer {
        interval: root.tokens.clockTickMilliseconds
        running: true
        repeat: true
        onTriggered: root.now = new Date()
    }

    Connections {
        target: sddm

        function onLoginFailed(): void {
            root.errorText = root.tokens.failedText;
            password.clear();
            password.forceActiveFocus();
        }
    }

    Image {
        id: wallpaper

        anchors.fill: parent
        source: config.background
        fillMode: Image.PreserveAspectCrop
    }

    MultiEffect {
        anchors.fill: parent
        source: wallpaper
        blurEnabled: true
        blurMax: root.tokens.blurMax
        blur: root.signInVisible ? root.tokens.blurAmount : 0

        Behavior on blur {
            NumberAnimation {
                duration: root.tokens.transitionMilliseconds
            }
        }
    }

    Rectangle {
        anchors.fill: parent
        color: root.tokens.dim
        opacity: root.signInVisible ? root.tokens.dimOpacity : 0

        Behavior on opacity {
            NumberAnimation {
                duration: root.tokens.transitionMilliseconds
            }
        }
    }

    MouseArea {
        anchors.fill: parent
        enabled: !root.signInVisible
        onClicked: root.showSignIn()
    }

    Column {
        anchors.horizontalCenter: parent.horizontalCenter
        y: root.height * root.tokens.clockTopRatio
        opacity: root.signInVisible ? 0 : 1
        visible: opacity > 0

        Behavior on opacity {
            NumberAnimation {
                duration: root.tokens.transitionMilliseconds
            }
        }

        Text {
            anchors.horizontalCenter: parent.horizontalCenter
            text: Qt.formatTime(root.now, root.tokens.timeFormat)
            color: root.tokens.text
            font.family: root.tokens.fontFamily
            font.pixelSize: root.tokens.clockFontSize
            font.weight: Font.DemiBold
        }

        Text {
            anchors.horizontalCenter: parent.horizontalCenter
            text: Qt.formatDate(root.now, root.tokens.dateFormat)
            color: root.tokens.text
            font.family: root.tokens.fontFamily
            font.pixelSize: root.tokens.dateFontSize
        }
    }

    Text {
        anchors.horizontalCenter: parent.horizontalCenter
        anchors.bottom: parent.bottom
        anchors.bottomMargin: root.tokens.edgeMargin
        text: root.tokens.pressToUnlockText
        color: root.tokens.textSecondary
        font.family: root.tokens.fontFamily
        font.pixelSize: root.tokens.bodyFontSize
        opacity: root.signInVisible ? 0 : 1
    }

    Column {
        anchors.centerIn: parent
        spacing: root.tokens.spacing
        opacity: root.signInVisible ? 1 : 0
        visible: opacity > 0

        Behavior on opacity {
            NumberAnimation {
                duration: root.tokens.transitionMilliseconds
            }
        }

        Avatar {
            anchors.horizontalCenter: parent.horizontalCenter
            size: root.tokens.avatarSize
            source: root.currentUser ? root.currentUser.icon : ""
        }

        Text {
            anchors.horizontalCenter: parent.horizontalCenter
            text: root.currentUser ? root.currentUser.displayName : ""
            color: root.tokens.text
            font.family: root.tokens.fontFamily
            font.pixelSize: root.tokens.nameFontSize
            font.weight: Font.DemiBold
        }

        Row {
            anchors.horizontalCenter: parent.horizontalCenter
            spacing: root.tokens.spacing / 2

            TextField {
                id: password

                width: root.tokens.fieldWidth
                height: root.tokens.fieldHeight
                echoMode: TextInput.Password
                placeholderText: root.tokens.passwordPlaceholder
                placeholderTextColor: root.tokens.textSecondary
                color: root.tokens.text
                font.family: root.tokens.fontFamily
                font.pixelSize: root.tokens.bodyFontSize
                leftPadding: root.tokens.spacing / 2
                verticalAlignment: TextInput.AlignVCenter
                onAccepted: root.login()
                Keys.onEscapePressed: {
                    root.signInVisible = false;
                    root.forceActiveFocus();
                }

                background: Rectangle {
                    radius: root.tokens.controlRadius
                    color: root.tokens.field
                    border.width: 1
                    border.color: root.tokens.fieldStroke

                    Rectangle {
                        anchors.left: parent.left
                        anchors.right: parent.right
                        anchors.bottom: parent.bottom
                        height: password.activeFocus ? 2 : 1
                        radius: root.tokens.controlRadius
                        color: password.activeFocus ? root.tokens.accent : root.tokens.fieldStroke
                    }
                }
            }

            IconButton {
                iconSource: root.tokens.arrowIcon
                label: root.tokens.signInText
                height: root.tokens.fieldHeight
                width: root.tokens.fieldHeight
                onClicked: root.login()
            }
        }

        Text {
            anchors.horizontalCenter: parent.horizontalCenter
            text: root.errorText
            visible: root.errorText !== ""
            color: root.tokens.error
            font.family: root.tokens.fontFamily
            font.pixelSize: root.tokens.bodyFontSize
        }
    }

    ListView {
        id: users

        anchors.left: parent.left
        anchors.bottom: parent.bottom
        anchors.margins: root.tokens.edgeMargin
        width: root.tokens.fieldWidth
        height: Math.min(contentHeight, root.height / 2)
        model: userModel
        currentIndex: userModel.lastIndex >= 0 ? userModel.lastIndex : 0
        spacing: root.tokens.spacing / 2
        interactive: contentHeight > height
        opacity: count > 1 ? 1 : 0
        delegate: UserEntry {}
    }

    Row {
        anchors.right: parent.right
        anchors.bottom: parent.bottom
        anchors.margins: root.tokens.edgeMargin
        spacing: root.tokens.spacing / 2

        ComboBox {
            id: sessions

            anchors.verticalCenter: parent.verticalCenter
            width: root.tokens.fieldWidth / 2
            height: root.tokens.fieldHeight
            model: sessionModel
            textRole: "name"
            currentIndex: root.sessionIndex
            visible: count > 1
            font.family: root.tokens.fontFamily
            palette.button: root.tokens.field
            palette.buttonText: root.tokens.text
            palette.window: root.tokens.menu
            palette.windowText: root.tokens.text
            palette.base: root.tokens.menu
            palette.text: root.tokens.text
            palette.highlight: root.tokens.accent
            palette.highlightedText: root.tokens.background
            palette.mid: root.tokens.fieldStroke
            palette.dark: root.tokens.text
            Accessible.name: root.tokens.sessionText
            onActivated: (index) => root.sessionIndex = index
        }

        IconButton {
            iconSource: root.tokens.sleepIcon
            label: root.tokens.sleepText
            visible: sddm.canSuspend
            onClicked: sddm.suspend()
        }

        IconButton {
            iconSource: root.tokens.restartIcon
            label: root.tokens.restartText
            visible: sddm.canReboot
            onClicked: sddm.reboot()
        }

        IconButton {
            iconSource: root.tokens.powerIcon
            label: root.tokens.shutDownText
            visible: sddm.canPowerOff
            onClicked: sddm.powerOff()
        }
    }
}
