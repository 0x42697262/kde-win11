import argparse
import os
import sys

from PySide6.QtCore import QAbstractListModel, QByteArray, QEvent, QModelIndex, QObject, Property, Qt, QTimer, QUrl, Signal, Slot, qInstallMessageHandler
from PySide6.QtGui import QGuiApplication, QKeyEvent
from PySide6.QtQml import QQmlPropertyMap
from PySide6.QtQuick import QQuickView

PROBLEM_MARKERS = ("rror", "is not a type", "is not installed", "Cannot assign", "Unable to assign", "undefined", "Cannot read property")
SPLASH_STAGE = 2
WINDOW_SIZE = (1280, 720)
FIRST_SHOT_MS = 600
SIGN_IN_MS = 700
TYPE_MS = 1100
SECOND_SHOT_MS = 1700
QUIT_MS = 2000
WRONG_PASSWORD = "wrong"


class RoleModel(QAbstractListModel):
    def __init__(self, roles, rows, last_index):
        super().__init__()
        self._roles = roles
        self._rows = rows
        self._last_index = last_index

    def rowCount(self, parent=QModelIndex()):
        return len(self._rows)

    def roleNames(self):
        return {Qt.UserRole + offset + 1: QByteArray(role.encode()) for offset, role in enumerate(self._roles)}

    def data(self, index, role):
        column = role - Qt.UserRole - 1
        return self._rows[index.row()][column] if 0 <= column < len(self._roles) else None

    def _last(self):
        return self._last_index

    def _count(self):
        return len(self._rows)

    lastIndex = Property(int, _last, constant=True)
    count = Property(int, _count, constant=True)


class FakeSddm(QObject):
    loginFailed = Signal()
    loginSucceeded = Signal()

    @Slot(str, str, int)
    def login(self, user, password, session):
        print(f"login user={user} session={session}")
        self.loginFailed.emit()

    @Slot()
    def powerOff(self):
        print("powerOff")

    @Slot()
    def reboot(self):
        print("reboot")

    @Slot()
    def suspend(self):
        print("suspend")

    def _yes(self):
        return True

    canPowerOff = Property(bool, _yes, constant=True)
    canReboot = Property(bool, _yes, constant=True)
    canSuspend = Property(bool, _yes, constant=True)


def main():
    parser = argparse.ArgumentParser(description="Load a splash or SDDM QML file, screenshot it and fail on QML warnings")
    parser.add_argument("mode", choices=["splash", "login"])
    parser.add_argument("qml")
    parser.add_argument("output_prefix")
    parser.add_argument("--avatar", default="")
    arguments = parser.parse_args()

    messages = []
    finished = []

    def collect(_mode, _context, message):
        if not finished:
            messages.append(message)
            print(f"qml: {message}")

    qInstallMessageHandler(collect)
    application = QGuiApplication(sys.argv)
    view = QQuickView()
    view.setResizeMode(QQuickView.SizeRootObjectToView)
    view.resize(*WINDOW_SIZE)
    keep_alive = []
    if arguments.mode == "login":
        users = RoleModel(["name", "realName", "icon", "homeDir"], [["alex", "Alex Doe", arguments.avatar, "/home/alex"], ["sam", "Sam", "", "/home/sam"]], 0)
        sessions = RoleModel(["name", "file"], [["Plasma (Wayland)", "plasma.desktop"], ["Plasma (X11)", "plasmax11.desktop"]], 0)
        sddm = FakeSddm()
        config = QQmlPropertyMap()
        config.insert("background", "background.jpg")
        keep_alive.extend([users, sessions, sddm, config])
        context = view.rootContext()
        context.setContextProperty("userModel", users)
        context.setContextProperty("sessionModel", sessions)
        context.setContextProperty("sddm", sddm)
        context.setContextProperty("config", config)
    view.setSource(QUrl.fromLocalFile(os.path.abspath(arguments.qml)))
    if view.status() != QQuickView.Ready:
        for error in view.errors():
            print(f"error: {error.toString()}")
        return 1
    view.show()
    root = view.rootObject()

    def screenshot(suffix):
        def save():
            path = f"{arguments.output_prefix}{suffix}.png"
            view.grabWindow().save(path)
            print(f"saved {path}")
        return save

    def type_wrong_password():
        for character in WRONG_PASSWORD:
            for event_type in (QEvent.KeyPress, QEvent.KeyRelease):
                QGuiApplication.sendEvent(view, QKeyEvent(event_type, ord(character.upper()), Qt.NoModifier, character))
        for event_type in (QEvent.KeyPress, QEvent.KeyRelease):
            QGuiApplication.sendEvent(view, QKeyEvent(event_type, Qt.Key_Return, Qt.NoModifier, "\r"))

    def quit_application():
        finished.append(True)
        application.quit()

    if arguments.mode == "splash":
        root.setProperty("stage", SPLASH_STAGE)
        QTimer.singleShot(FIRST_SHOT_MS, screenshot(""))
    else:
        QTimer.singleShot(FIRST_SHOT_MS, screenshot("-lock"))
        QTimer.singleShot(SIGN_IN_MS, root.showSignIn)
        QTimer.singleShot(TYPE_MS, type_wrong_password)
        QTimer.singleShot(SECOND_SHOT_MS, screenshot("-signin"))
    QTimer.singleShot(QUIT_MS, quit_application)
    application.exec()
    problems = [message for message in messages if any(marker in message for marker in PROBLEM_MARKERS)]
    print(f"qml-preview: {len(problems)} problem(s) in {arguments.qml}")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
