# Windows entries in Plasma's desktop menu, KDE entries kept

Status: accepted

## Context

Right-clicking the Windows 11 desktop offers View, Sort by, Refresh, New,
Display settings, Personalize and Open in Terminal. Plasma's desktop menu is
Folder View's file actions (New, Paste, Refresh, Sort by, Icons) followed by
the `org.kde.contextmenu` plugin. The plugin lets each entry be shown or hidden
in `plasma-org.kde.plasma.desktop-appletsrc` under
`[ActionPlugins][0][RightButton;NoModifier]`, but not reordered or renamed.

## Decision

Show the entries with a Windows counterpart (Display Settings, Configure
Desktop and Wallpaper for Personalize, Open Terminal, Next Wallpaper) and keep
KDE's desktop editing entries (Add Widgets, Edit Mode, Add Panel, widget
actions). Hide session and rarely used entries (lock, log out, run command,
activities, shortcuts, remove). Every entry is a `desktopMenu.*` setting. The
global theme's layout script writes them, and `tools/install.sh` writes them
with `kwriteconfig6` for users who keep their own layout.

## Consequences

The desktop menu carries both the Windows and the KDE entries. Labels and
order stay Plasma's. Changes from the installer apply after Plasma restarts.
