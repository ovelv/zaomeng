export type Settings = {
  arkApiKey: string;
  arkBaseUrl: string;
  seedanceModel: string;
  seedreamModel: string;
  storyboardModel: string;
};

const DEFAULT_SETTINGS: Settings = {
  arkApiKey: "",
  arkBaseUrl: "https://ark.cn-beijing.volces.com/api/v3",
  seedanceModel: "",
  seedreamModel: "",
  storyboardModel: "",
};

export function getSettings(): Settings {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }
  const saved = localStorage.getItem("zaomeng_settings");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch (e) {
      // Ignore parse error
    }
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: Settings) {
  if (typeof window !== "undefined") {
    localStorage.setItem("zaomeng_settings", JSON.stringify(settings));
  }
}
