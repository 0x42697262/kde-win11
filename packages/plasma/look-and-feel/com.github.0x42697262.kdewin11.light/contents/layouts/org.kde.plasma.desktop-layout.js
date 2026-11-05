const settings = {
    "height": 48,
    "floating": false,
    "launchers": [
        "preferred://filemanager",
        "preferred://browser",
        "applications:org.kde.konsole.desktop",
        "applications:org.kde.discover.desktop",
        "applications:systemsettings.desktop"
    ],
    "favoritesDisplay": 0,
    "applicationsDisplay": 1,
    "showDate": true,
    "dateDisplayFormat": 2,
    "showDesktopButton": true,
    "startIcon": "start-here-kde-win11",
    "kickoffShortcut": "Alt+F1",
    "wallpaperPackage": "wallpapers/kde-win11",
    "widgets": {
        "kickoff": "org.kde.plasma.kickoff",
        "tasks": "org.kde.plasma.icontasks",
        "spacer": "org.kde.plasma.panelspacer",
        "tray": "org.kde.plasma.systemtray",
        "clock": "org.kde.plasma.digitalclock",
        "showDesktop": "org.kde.plasma.showdesktop",
        "wallpaper": "org.kde.image"
    },
    "desktopMenu": {
        "file": "plasma-org.kde.plasma.desktop-appletsrc",
        "groups": [
            "ActionPlugins",
            "0"
        ],
        "trigger": "RightButton;NoModifier",
        "plugin": "org.kde.contextmenu",
        "actions": {
            "_display_settings": true,
            "configure": true,
            "_open_terminal": true,
            "_wallpaper": true,
            "add widgets": true,
            "edit mode": true,
            "_add panel": true,
            "_context": true,
            "manage activities": false,
            "configure shortcuts": false,
            "remove": false,
            "run associated application": false,
            "_run_command": false,
            "_lock_screen": false,
            "_logout": false,
            "_sep1": true,
            "_sep2": true,
            "_sep3": true
        }
    }
};

const panel = new Panel;
panel.location = "bottom";
panel.height = settings.height;
panel.alignment = "center";
panel.hiding = "none";
try { panel.lengthMode = "fill"; } catch (error) { print(error); }
try { panel.floating = settings.floating; } catch (error) { print(error); }

function addSpacer() {
    const spacer = panel.addWidget(settings.widgets.spacer);
    spacer.currentConfigGroup = ["General"];
    spacer.writeConfig("expanding", true);
}

addSpacer();
const kickoff = panel.addWidget(settings.widgets.kickoff);
kickoff.currentConfigGroup = ["General"];
kickoff.writeConfig("icon", settings.startIcon);
kickoff.writeConfig("favoritesDisplay", settings.favoritesDisplay);
kickoff.writeConfig("applicationsDisplay", settings.applicationsDisplay);
kickoff.writeConfig("showActionButtonCaptions", false);
kickoff.currentConfigGroup = ["Shortcuts"];
kickoff.writeConfig("global", settings.kickoffShortcut);

const tasks = panel.addWidget(settings.widgets.tasks);
tasks.currentConfigGroup = ["General"];
tasks.writeConfig("launchers", settings.launchers);
tasks.writeConfig("showOnlyCurrentDesktop", false);
tasks.writeConfig("maxStripes", 1);
tasks.writeConfig("indicateAudioStreams", true);

addSpacer();
panel.addWidget(settings.widgets.tray);
const clock = panel.addWidget(settings.widgets.clock);
clock.currentConfigGroup = ["Appearance"];
clock.writeConfig("showDate", settings.showDate);
clock.writeConfig("dateDisplayFormat", settings.dateDisplayFormat);
clock.writeConfig("dateFormat", "shortDate");
if (settings.showDesktopButton) {
    panel.addWidget(settings.widgets.showDesktop);
}

const wallpaper = "file://" + userDataPath() + "/.local/share/" + settings.wallpaperPackage + "/";
try {
    let menuGroup = new ConfigFile(settings.desktopMenu.file, settings.desktopMenu.groups[0]);
    settings.desktopMenu.groups.slice(1).forEach(function (group) {
        menuGroup = new ConfigFile(menuGroup, group);
    });
    menuGroup.writeEntry(settings.desktopMenu.trigger, settings.desktopMenu.plugin);
    const menuActions = new ConfigFile(menuGroup, settings.desktopMenu.trigger);
    Object.keys(settings.desktopMenu.actions).forEach(function (action) {
        menuActions.writeEntry(action, settings.desktopMenu.actions[action]);
    });
} catch (error) { print(error); }

desktops().forEach(function (desktop) {
    desktop.wallpaperPlugin = settings.widgets.wallpaper;
    desktop.currentConfigGroup = ["Wallpaper", settings.widgets.wallpaper, "General"];
    desktop.writeConfig("Image", wallpaper);
});
