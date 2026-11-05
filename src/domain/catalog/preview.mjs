export const PREVIEW_TEXT = Object.freeze({
    windowTitle: "Home",
    search: "Search for apps, settings and documents",
    pinned: "Pinned",
    allApps: "All apps",
    recommended: "Recommended",
    userName: "Alex",
    time: "10:42",
    date: "11/5/2026",
    sidebar: ["Home", "Desktop", "Documents", "Downloads", "Music", "Pictures", "Videos"],
    files: ["Desktop", "Documents", "Downloads", "Music", "Pictures", "Videos", "Projects", "Report.pdf", "Notes.txt", "Budget.ods", "Slides.odp", "Photo.png"],
    recentFiles: ["Report.pdf", "Budget.ods", "Slides.odp", "Photo.png"],
    recentTimes: ["Just now", "12m ago", "Yesterday", "Monday"],
});

export const PREVIEW_ICONS = Object.freeze({
    sidebar: ["user-home", "user-desktop", "folder-documents", "folder-download", "folder-music", "folder-pictures", "folder-videos"],
    files: ["user-desktop", "folder-documents", "folder-download", "folder-music", "folder-pictures", "folder-videos", "folder-development", "application-pdf", "text-plain", "x-office-spreadsheet", "x-office-presentation", "image-png"],
    recent: ["application-pdf", "x-office-spreadsheet", "x-office-presentation", "image-png"],
    taskbar: ["start-here", "system-file-manager", "internet-web-browser", "utilities-terminal", "org.kde.discover", "systemsettings"],
    tray: ["network-wireless-signal-excellent", "audio-volume-high", "battery-080"],
    pinned: ["system-file-manager", "internet-web-browser", "utilities-terminal", "org.kde.discover", "systemsettings", "accessories-text-editor", "accessories-calculator", "org.kde.spectacle", "org.kde.gwenview", "org.kde.okular", "multimedia-video-player", "multimedia-audio-player", "utilities-system-monitor", "accessories-calendar", "internet-mail", "org.kde.ark", "help-browser", "org.kde.kdeconnect.app"],
    pinnedLabels: ["Files", "Browser", "Terminal", "Discover", "Settings", "Text Editor", "Calculator", "Screenshot", "Photos", "Documents", "Videos", "Music", "System Monitor", "Calendar", "Mail", "Archives", "Help", "Phone Link"],
    toolbar: ["go-previous", "go-next", "go-up", "view-refresh"],
    power: "system-shutdown",
    search: "system-search",
    caption: ["minimize", "maximize", "close"],
});

export const PREVIEW_LAYOUT = Object.freeze({
    width: 1920,
    height: 1080,
    font: "'Inter', 'Segoe UI', 'Noto Sans', sans-serif",
    window: { left: 150, top: 90, width: 1060, height: 640 },
    start: { width: 642, height: 720, bottomGap: 12 },
    sidebarWidth: 210,
    iconSize: 64,
    tileIconSize: 32,
    trayIconSize: 16,
    taskbarIconSize: 24,
    taskButton: 44,
    taskHeight: 40,
});

export const PREVIEW_STYLESHEET = `* { box-sizing: border-box; margin: 0; }
body { width: {{layout_width}}px; height: {{layout_height}}px; overflow: hidden; font-family: {{layout_font}}; color: {{color_textPrimary}}; background: url("{{wallpaper}}") center / cover; font-size: 14px; }
.surface { position: absolute; border-radius: {{flyout_radius}}px; border: {{flyout_stroke}}px solid {{color_surfaceStroke}}; background: {{color_flyout}}; backdrop-filter: blur(30px) saturate(1.8); box-shadow: 0 {{flyout_shadowOffset}}px {{flyout_shadowSize_2}}px {{color_shadow}}; }
.window { left: {{layout_window_left}}px; top: {{layout_window_top}}px; width: {{layout_window_width}}px; height: {{layout_window_height}}px; background: {{color_window}}; border-radius: {{titlebar_radius}}px {{titlebar_radius}}px 0 0; border-color: {{color_windowStroke}}; overflow: hidden; display: flex; flex-direction: column; }
.titlebar { height: {{titlebar_height}}px; display: flex; align-items: center; background: {{color_titlebar}}; padding-left: {{titlebar_titleEdgeLeft}}px; font-size: 12px; gap: 8px; }
.titlebar .title { flex: 1; }
.caption { width: {{titlebar_buttonWidth}}px; height: {{titlebar_height}}px; overflow: hidden; position: relative; }
.caption img { position: absolute; left: -{{SHEET_GAP}}px; top: -{{SHEET_GAP}}px; }
.toolbar { height: 48px; display: flex; align-items: center; gap: 12px; padding: 0 16px; }
.address { flex: 1; height: 32px; border-radius: 4px; background: {{color_view}}; border: 1px solid {{color_divider}}; display: flex; align-items: center; padding: 0 10px; gap: 8px; color: {{color_textSecondary}}; }
.content { flex: 1; display: flex; background: {{color_view}}; border-top: 1px solid {{color_divider}}; }
.sidebar { width: {{layout_sidebarWidth}}px; padding: 8px; background: {{color_window}}; border-right: 1px solid {{color_divider}}; }
.sidebar div { height: 34px; display: flex; align-items: center; gap: 10px; padding: 0 10px; border-radius: 4px; }
.sidebar div.selected { background: {{color_subtleFillHover}}; box-shadow: inset 3px 0 0 {{color_accentForMode}}; }
.grid { flex: 1; display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; padding: 16px; align-content: start; }
.grid div { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 8px; font-size: 12px; border-radius: 4px; }
.grid div.selected { background: {{color_selectionHover}}; }
.start { left: {{startLeft}}px; top: {{startTop}}px; width: {{layout_start_width}}px; height: {{layout_start_height}}px; padding: 24px 32px 0; display: flex; flex-direction: column; }
.search { height: 34px; border-radius: 17px; background: {{color_view}}; border: 1px solid {{color_divider}}; border-bottom: 2px solid {{color_accentForMode}}; display: flex; align-items: center; gap: 10px; padding: 0 14px; color: {{color_textSecondary}}; }
.heading { display: flex; justify-content: space-between; align-items: center; margin: 22px 8px 12px; font-weight: 600; }
.pill { font-weight: 400; font-size: 12px; padding: 4px 10px; border-radius: 4px; background: {{color_subtleFillHover}}; }
.tiles { display: grid; grid-template-columns: repeat(6, 1fr); row-gap: 14px; }
.tiles div { display: flex; flex-direction: column; align-items: center; gap: 8px; font-size: 12px; }
.recent { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.recent div { display: flex; gap: 12px; align-items: center; padding: 8px; font-size: 12px; }
.recent small { color: {{color_textSecondary}}; display: block; }
.footer { margin: auto -32px 0; height: 64px; border-top: 1px solid {{color_divider}}; background: {{color_subtleFillPressed}}; display: flex; align-items: center; justify-content: space-between; padding: 0 52px; border-radius: 0 0 {{flyout_radius}}px {{flyout_radius}}px; }
.avatar { width: 32px; height: 32px; border-radius: 16px; background: {{color_accentForMode}}; color: {{color_textOnAccent}}; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; font-weight: 600; }
.taskbar { position: absolute; left: 0; right: 0; bottom: 0; height: {{panel_height}}px; background: {{color_taskbar}}; border-top: {{panel_stroke}}px solid {{color_surfaceStroke}}; backdrop-filter: blur(30px) saturate(1.8); }
.tasks { position: absolute; left: 50%; transform: translateX(-50%); top: 0; height: 100%; display: flex; align-items: center; gap: 4px; }
.task { width: {{layout_taskButton}}px; height: {{layout_taskButton_4}}px; border-radius: {{panel_taskRadius}}px; display: flex; align-items: center; justify-content: center; position: relative; }
.task.focus { background: {{color_subtleFillHover}}; }
.task.running::after { content: ""; position: absolute; bottom: 1px; width: {{layout_taskButton_panel_taskIndicatorInset_2}}px; height: {{panel_taskIndicatorThickness}}px; border-radius: 2px; background: {{color_taskIndicator}}; }
.task.focus::after { width: {{layout_taskButton_panel_taskFocusIndicatorInset_2}}px; background: {{color_accentForMode}}; }
.tray { position: absolute; right: 16px; top: 0; height: 100%; display: flex; align-items: center; gap: 14px; }
.clock { text-align: right; font-size: 12px; line-height: 16px; }
`;

export const PREVIEW_TASK_STATES = Object.freeze(["", "running focus", "running", "running", "", ""]);
