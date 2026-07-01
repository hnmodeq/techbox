export type NvrModel = {
  id: string;
  name: string;
  nameFa: string;
  maxCameras: number;
  storageBays: number;
  raidSupport: string;
  maxResolution: string;
  aiFeatures: boolean;
  price?: number;
  priceLabel?: string;
  description: string;
  descriptionFa: string;
  shopSlug?: string;
  href?: string;
  imageUrl?: string;
  poePorts?: number;
  throughputMbps?: number;
  inStock?: boolean;
};

export type NvrFilterState = {
  cameras: number;
  resolution: string;
  days: number;
  aiEnabled: boolean;
};

export const nvrResolutions = ["1080p", "4MP", "4K", "8MP"] as const;

export function estimateNvrStorageTb(cameras: number, resolution: string, days: number) {
  const basePerCam = resolution === "1080p" ? 4 : resolution === "4MP" ? 8 : resolution === "4K" ? 16 : 24;
  return Math.round((cameras * basePerCam * days) / 1000);
}

export const defaultNvrFilter: NvrFilterState = {
  cameras: 8,
  resolution: "4MP",
  days: 30,
  aiEnabled: true,
};
