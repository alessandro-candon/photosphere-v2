import type {FileTypeEnum} from "@/protobuf/photosphere-file.ts";

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
  type?: FileTypeEnum
}
