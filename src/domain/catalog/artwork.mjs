export const ARTWORK_GRID = 64;

export const FOLDER_SHAPES = Object.freeze({
    back: "M6 14a4 4 0 0 1 4-4h13.2a4 4 0 0 1 2.9 1.2L30 15h24a4 4 0 0 1 4 4v29a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4Z",
    paper: "M11 18h42a2 2 0 0 1 2 2v14H9V20a2 2 0 0 1 2-2Z",
    front: "M6 26a4 4 0 0 1 4-4h44a4 4 0 0 1 4 4v22a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4Z",
    frontOpen: "M12.6 24H57a3 3 0 0 1 2.9 3.8l-5.5 21.3A4 4 0 0 1 50.5 52H8.4a3 3 0 0 1-2.9-3.7l3.3-21.3a4 4 0 0 1 3.8-3Z",
    highlight: "M10 22h44a4 4 0 0 1 4 4v1a4 4 0 0 0-4-4H10a4 4 0 0 0-4 4v-1a4 4 0 0 1 4-4Z",
});

export const FOLDER_GLYPH_BOX = Object.freeze({ x: 23, y: 28, size: 18 });

export const PAGE_SHAPES = Object.freeze({
    page: "M15 4h25l12 12v41a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z",
    fold: "M40 4v9a3 3 0 0 0 3 3h9Z",
});

export const PAGE_GLYPH_BOX = Object.freeze({ x: 20, y: 26, size: 24 });
export const PAGE_STROKE_WIDTH = 1;

export const TILE_SHAPES = Object.freeze({
    tile: "M16 4h32a12 12 0 0 1 12 12v32a12 12 0 0 1-12 12H16A12 12 0 0 1 4 48V16A12 12 0 0 1 16 4Z",
    shine: "M16 4h32a12 12 0 0 1 12 12v8H4v-8A12 12 0 0 1 16 4Z",
});

export const TILE_GLYPH_BOX = Object.freeze({ x: 16, y: 16, size: 32 });

export const DRIVE_SHAPES = Object.freeze({
    body: "M13 18h38a5 5 0 0 1 5 5v18a5 5 0 0 1-5 5H13a5 5 0 0 1-5-5V23a5 5 0 0 1 5-5Z",
    face: "M8 36h48v5a5 5 0 0 1-5 5H13a5 5 0 0 1-5-5Z",
    light: "M47 41a2 2 0 1 0 4 0a2 2 0 1 0-4 0Z",
    disc: "M8 32a24 24 0 1 0 48 0a24 24 0 1 0-48 0ZM28 32a4 4 0 1 1 8 0a4 4 0 1 1-8 0Z",
    discRing: "M22 32a10 10 0 1 0 20 0a10 10 0 1 0-20 0ZM27 32a5 5 0 1 1 10 0a5 5 0 1 1-10 0Z",
});

export const DRIVE_GLYPH_BOX = Object.freeze({ x: 24, y: 20, size: 14 });

export const TRASH_SHAPES = Object.freeze({
    lid: "M14 14a3 3 0 0 1 3-3h30a3 3 0 0 1 3 3v3H14Z",
    handle: "M26 11V9a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2h-2.5V9.5h-7V11Z",
    body: "M16 19h32l-2.6 34.2a4 4 0 0 1-4 3.8H22.6a4 4 0 0 1-4-3.8Z",
    ribs: "M25 25h2v26h-2ZM31 25h2v26h-2ZM37 25h2v26h-2Z",
    paper: "M18 13l9-8 7 4 8-5 6 9Z",
});

export const TRASH_STROKE_WIDTH = 1.2;

export const GLYPH_FOLDERS = Object.freeze([
    { names: ["folder", "inode-directory", "folder-blue", "folder-yellow", "folder-orange", "folder-grey", "folder-root", "folder-saved-search"] },
    { names: ["folder-open", "folder-drag-accept", "folder-visiting"], open: true },
    { names: ["folder-documents", "folder-text"], glyph: "document" },
    { names: ["folder-download", "folder-downloads", "folder-downloads-blue"], glyph: "arrow_download" },
    { names: ["folder-music", "folder-sound", "folder-audio"], glyph: "music_note_2" },
    { names: ["folder-pictures", "folder-images", "folder-image", "folder-photos"], glyph: "image" },
    { names: ["folder-videos", "folder-video", "folder-movies"], glyph: "video" },
    { names: ["folder-desktop", "user-desktop", "desktop"], glyph: "desktop" },
    { names: ["folder-templates", "folder-documents-templates"], glyph: "document_copy" },
    { names: ["folder-publicshare", "folder-public"], glyph: "people" },
    { names: ["folder-cloud", "folder-dropbox", "folder-onedrive"], glyph: "cloud" },
    { names: ["folder-development", "folder-code", "folder-git", "folder-projects"], glyph: "code" },
    { names: ["folder-games"], glyph: "games" },
    { names: ["user-home", "folder-home", "go-home-folder"], glyph: "home" },
    { names: ["folder-remote", "folder-network", "network-workgroup", "network-server", "folder-remote-ftp"], glyph: "globe" },
    { names: ["folder-recent", "document-open-recent-folder"], glyph: "history" },
    { names: ["folder-favorites", "folder-bookmark", "folder-important"], glyph: "star" },
    { names: ["folder-locked", "folder-encrypted"], glyph: "lock_closed" },
]);

export const DRIVES = Object.freeze([
    { names: ["drive-harddisk", "drive-harddisk-solidstate", "drive-harddisk-system", "drive-harddisk-root", "drive-multidisk", "harddrive"] },
    { names: ["drive-removable-media", "drive-removable-media-usb", "drive-removable-media-usb-pendrive", "media-flash", "media-flash-sd-mmc"], glyph: "usb_stick" },
    { names: ["drive-optical", "media-optical", "media-optical-cd", "media-optical-dvd", "media-optical-audio", "media-optical-data"], disc: true },
]);

export const TRASH = Object.freeze([
    { names: ["user-trash", "trash-empty-folder"], full: false },
    { names: ["user-trash-full"], full: true },
]);

export const MIME_TYPES = Object.freeze([
    { glyph: "document_text", color: "#5f6b7a", names: ["text-plain", "text-x-generic", "application-x-zerosize", "text-x-readme", "text-markdown", "text-x-log", "text-x-changelog", "text-x-copying"] },
    { glyph: "document", color: "#8a8a8a", names: ["unknown", "application-octet-stream", "application-x-generic", "empty"] },
    { glyph: "document_pdf", color: "#d13438", names: ["application-pdf", "application-x-pdf", "application-postscript", "image-x-eps"] },
    { glyph: "image", color: "#0f7bd3", names: ["image-x-generic", "image-png", "image-jpeg", "image-gif", "image-webp", "image-bmp", "image-tiff", "image-svg+xml", "image-x-xcf", "image-avif", "image-heif", "image-x-icon", "image-vnd.microsoft.icon"] },
    { glyph: "music_note_2", color: "#e8590c", names: ["audio-x-generic", "audio-mpeg", "audio-x-wav", "audio-flac", "audio-ogg", "audio-x-vorbis+ogg", "audio-mp4", "audio-aac", "audio-x-opus+ogg", "audio-x-mpegurl"] },
    { glyph: "video_clip", color: "#7c3aed", names: ["video-x-generic", "video-mp4", "video-x-matroska", "video-webm", "video-x-msvideo", "video-quicktime", "video-mpeg", "video-x-flv"] },
    { glyph: "folder_zip", color: "#c58a00", names: ["package-x-generic", "application-zip", "application-x-tar", "application-x-compressed-tar", "application-x-7z-compressed", "application-x-rar", "application-vnd.rar", "application-gzip", "application-x-xz", "application-x-bzip", "application-x-archive", "application-x-xz-compressed-tar", "application-x-bzip-compressed-tar", "application-zstd", "application-x-zstd-compressed-tar", "application-x-rpm", "application-vnd.debian.binary-package", "application-x-deb"] },
    { glyph: "globe", color: "#0078d4", names: ["text-html", "application-xhtml+xml", "text-xml", "application-xml", "text-x-uri", "application-x-mswinurl"] },
    { glyph: "code", color: "#2b7a78", names: ["text-x-script", "application-x-shellscript", "text-x-python", "text-x-python3", "application-javascript", "text-javascript", "text-x-csrc", "text-x-chdr", "text-x-c++src", "text-x-c++hdr", "text-x-java", "text-rust", "text-x-rust", "text-x-go", "application-json", "text-x-makefile", "text-css", "text-x-cmake", "application-x-perl", "application-x-ruby", "text-x-lua", "application-x-php", "text-x-typescript", "application-toml", "application-x-yaml", "text-x-qml", "text-x-patch", "text-x-diff"] },
    { glyph: "app_generic", color: "#4a4a4a", names: ["application-x-executable", "application-x-sharedlib", "application-x-desktop", "application-x-object", "application-vnd.appimage", "application-x-ms-dos-executable", "application-x-msdownload", "application-x-msi", "application-vnd.flatpak.ref", "application-x-trash"] },
    { glyph: "document_text", color: "#185abd", names: ["x-office-document", "application-vnd.oasis.opendocument.text", "application-msword", "application-vnd.openxmlformats-officedocument.wordprocessingml.document", "application-rtf", "text-rtf", "application-epub+zip"] },
    { glyph: "table", color: "#107c41", names: ["x-office-spreadsheet", "application-vnd.oasis.opendocument.spreadsheet", "application-vnd.ms-excel", "application-vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text-csv"] },
    { glyph: "slide_text", color: "#c43e1c", names: ["x-office-presentation", "application-vnd.oasis.opendocument.presentation", "application-vnd.ms-powerpoint", "application-vnd.openxmlformats-officedocument.presentationml.presentation"] },
    { glyph: "hard_drive", color: "#6b7280", names: ["application-x-cd-image", "application-x-iso9660-image", "application-x-raw-disk-image", "application-vnd.efi.iso", "application-x-qemu-disk", "application-x-virtualbox-vdi"] },
    { glyph: "text_font", color: "#374151", names: ["font-x-generic", "application-x-font-ttf", "font-ttf", "font-otf", "application-x-font-otf", "font-woff", "font-woff2"] },
    { glyph: "calendar_ltr", color: "#2563eb", names: ["text-calendar", "x-office-calendar"] },
    { glyph: "person", color: "#ea580c", names: ["text-vcard", "text-x-vcard", "text-directory", "x-office-address-book"] },
    { glyph: "mail", color: "#0284c7", names: ["message-rfc822", "application-mbox", "message-x-generic"] },
    { glyph: "database", color: "#475569", names: ["application-x-sqlite3", "application-vnd.sqlite3", "application-sql", "text-x-sql"] },
    { glyph: "key", color: "#b45309", names: ["application-pgp-keys", "application-x-x509-ca-cert", "application-pkcs12", "application-x-pem-key"] },
]);

export const APP_TILES = Object.freeze([
    { glyph: "window_console", colors: ["#3c3c3c", "#151515"], names: ["utilities-terminal", "org.kde.konsole", "konsole", "terminal", "org.gnome.Terminal", "org.gnome.Console", "foot", "kitty", "Alacritty", "org.wezfurlong.wezterm", "xterm"] },
    { glyph: "settings", colors: ["#8592a3", "#4f5b69"], names: ["preferences-system", "systemsettings", "org.kde.systemsettings", "preferences-desktop", "gnome-control-center", "org.gnome.Settings", "preferences-system-windows-actions"] },
    { glyph: "shopping_bag", colors: ["#3a9bf4", "#0b5cad"], names: ["org.kde.discover", "plasmadiscover", "system-software-install", "software-store", "org.gnome.Software", "system-software-update", "softwarecenter"] },
    { glyph: "globe", colors: ["#3cc4f0", "#0067c0"], names: ["internet-web-browser", "web-browser", "org.kde.falkon", "falkon", "org.kde.konqueror", "konqueror", "org.gnome.Epiphany", "browser"] },
    { glyph: "notepad", colors: ["#5bc8f2", "#1f7fc4"], names: ["accessories-text-editor", "org.kde.kate", "kate", "org.kde.kwrite", "kwrite", "text-editor", "org.gnome.TextEditor", "gedit", "org.gnome.gedit"] },
    { glyph: "calculator", colors: ["#5d5d5d", "#2e2e2e"], names: ["accessories-calculator", "org.kde.kcalc", "kcalc", "org.gnome.Calculator", "gnome-calculator", "calc"] },
    { glyph: "screenshot", colors: ["#ff3fa4", "#b1006f"], names: ["org.kde.spectacle", "spectacle", "applets-screenshooter", "accessories-screenshot", "org.gnome.Screenshot", "screenshot-tool"] },
    { glyph: "image", colors: ["#45aaf5", "#1a5fc4"], names: ["org.kde.gwenview", "gwenview", "image-viewer", "eog", "org.gnome.eog", "org.gnome.Loupe", "multimedia-photo-viewer"] },
    { glyph: "document_pdf", colors: ["#f05a5f", "#b42318"], names: ["org.kde.okular", "okular", "accessories-document-viewer", "evince", "org.gnome.Evince", "org.gnome.Papers", "document-viewer"] },
    { glyph: "video_clip", colors: ["#9b6cf8", "#5b21b6"], names: ["multimedia-video-player", "org.kde.haruna", "haruna", "org.kde.dragonplayer", "dragonplayer", "totem", "org.gnome.Totem", "mpv", "io.github.celluloid_player.Celluloid", "video-player"] },
    { glyph: "music_note_2", colors: ["#ff7a4d", "#cc3a12"], names: ["multimedia-audio-player", "org.kde.elisa", "elisa", "rhythmbox", "org.gnome.Rhythmbox3", "audio-player", "org.gnome.Music"] },
    { glyph: "pulse", colors: ["#34c27f", "#11804b"], names: ["utilities-system-monitor", "org.kde.plasma-systemmonitor", "plasma-systemmonitor", "ksysguard", "gnome-system-monitor", "org.gnome.SystemMonitor", "system-monitor"] },
    { glyph: "question_circle", colors: ["#4f8ff7", "#1d4ed8"], names: ["help-browser", "org.kde.help", "khelpcenter", "org.gnome.Yelp", "help"] },
    { glyph: "info", colors: ["#7a8aa0", "#334155"], names: ["org.kde.kinfocenter", "kinfocenter", "hwinfo", "hardinfo", "system-information"] },
    { glyph: "folder_zip", colors: ["#f7c440", "#c98400"], names: ["org.kde.ark", "ark", "utilities-file-archiver", "file-roller", "org.gnome.FileRoller", "archive-manager"] },
    { glyph: "calendar_ltr", colors: ["#4f8ff7", "#2052d6"], names: ["accessories-calendar", "org.kde.merkuro", "org.kde.merkuro.calendar", "org.kde.korganizer", "korganizer", "office-calendar", "org.gnome.Calendar"] },
    { glyph: "mail", colors: ["#26b5f0", "#035f96"], names: ["internet-mail", "mail-client", "org.kde.kmail2", "kmail", "evolution", "org.gnome.Evolution", "org.gnome.Geary", "geary", "mail-mark-unread"] },
    { glyph: "phone", colors: ["#34cf6c", "#15803d"], names: ["org.kde.kdeconnect.app", "kdeconnect", "org.kde.kdeconnect-settings", "org.kde.kdeconnect.sms", "smartphone-app"] },
    { glyph: "storage", colors: ["#a3afc0", "#475569"], names: ["org.kde.partitionmanager", "partitionmanager", "gnome-disks", "org.gnome.DiskUtility", "drive-manager", "org.kde.filelight", "filelight"] },
    { glyph: "paint_brush", colors: ["#b96cf9", "#7e22ce"], names: ["preferences-desktop-theme", "preferences-desktop-color", "preferences-desktop-theme-global", "preferences-desktop-wallpaper", "preferences-desktop-theme-applications", "preferences-desktop-plasma-theme", "org.kde.krita", "krita"] },
    { glyph: "text_font", colors: ["#56657c", "#1e293b"], names: ["preferences-desktop-font", "org.kde.kfontview", "kfontview", "font-viewer", "org.gnome.font-viewer", "org.kde.kcharselect", "accessories-character-map"] },
    { glyph: "camera", colors: ["#fb5574", "#be123c"], names: ["org.kde.kamoso", "kamoso", "accessories-camera", "cheese", "org.gnome.Cheese", "org.gnome.Snapshot"] },
    { glyph: "clock", colors: ["#3b4a63", "#0f172a"], names: ["org.kde.kclock", "kclock", "org.gnome.clocks", "clock-app"] },
    { glyph: "people", colors: ["#fb8b3c", "#c2410c"], names: ["org.kde.kaddressbook", "kaddressbook", "office-address-book", "org.gnome.Contacts", "contacts"] },
    { glyph: "key", colors: ["#f2c230", "#a16207"], names: ["org.kde.kwalletmanager5", "kwalletmanager", "kwalletmanager2", "org.kde.kwalletmanager", "seahorse", "org.gnome.seahorse.Application", "password-manager", "dialog-password-app"] },
    { glyph: "bug", colors: ["#f46262", "#b91c1c"], names: ["org.kde.drkonqi", "drkonqi", "tools-report-bug", "apport"] },
    { glyph: "people_team", colors: ["#5b8def", "#3445b5"], names: ["system-users-app", "user-manager", "org.kde.plasma-settings-users", "preferences-system-users"] },
    { glyph: "lock_closed", colors: ["#7b8798", "#3f4856"], names: ["preferences-desktop-user-password", "preferences-system-privacy", "preferences-security-app"] },
    { glyph: "wifi_1", colors: ["#43a0f7", "#1659bf"], names: ["preferences-system-network-app", "nm-device-wireless", "network-manager", "preferences-system-network-connection"] },
    { glyph: "bluetooth", colors: ["#3a7cf2", "#1a3fb8"], names: ["preferences-system-bluetooth-app", "blueman", "bluedevil"] },
    { glyph: "speaker_2", colors: ["#9a8cf9", "#5b40d6"], names: ["preferences-desktop-sound", "multimedia-volume-control", "pavucontrol", "org.pulseaudio.pavucontrol", "audio-volume-control"] },
    { glyph: "desktop", colors: ["#4fb3f2", "#1d6bc4"], names: ["preferences-desktop-display", "preferences-desktop-display-randr", "display-settings", "kscreen"] },
    { glyph: "keyboard", colors: ["#7a8aa0", "#3f4a5c"], names: ["preferences-desktop-keyboard", "preferences-desktop-keyboard-shortcut", "input-keyboard-app"] },
    { glyph: "games", colors: ["#3fcf8a", "#11804b"], names: ["applications-games-app", "steam-games", "lutris", "net.lutris.Lutris"] },
]);

export const FILE_MANAGER_NAMES = Object.freeze(["system-file-manager", "org.kde.dolphin", "dolphin", "file-manager", "nautilus", "org.gnome.Nautilus", "thunar", "nemo", "pcmanfm"]);

export const START_HERE_NAMES = Object.freeze(["start-here", "start-here-kde", "start-here-kde-plasma", "start-here-kde-win11", "start-here-symbolic", "start-here-kde-symbolic", "start-here-kde-plasma-symbolic", "kde-win11-start"]);
export const START_HERE_GLYPH = "grid";
export const START_HERE_BOX = Object.freeze({ x: 4, y: 4, size: 56 });
export const START_HERE_LIGHTEN = 0.35;
