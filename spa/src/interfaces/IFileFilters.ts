import type {FileTypeEnum} from "@/interfaces/IPhotosphereViewFile.ts";

export default interface IFileFilters {
  dateRange: {
    active: boolean,
    startDate: Date | null,
    endDate: Date | null,
  },
  geohash: {
    active: boolean,
    latitude: number | null,
    longitude?: number | null,
    radius: number,
  },
  hashList?: string[] | null,
  excludeHashList?: string[] | null,
  type?: FileTypeEnum,
  fileName?: string | null,
  singleDateList?: Date[] | null,
}
