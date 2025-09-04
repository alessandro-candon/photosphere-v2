import protobuf from 'protobufjs';
import {convertSourceBucketUriToThumbnailUri} from "@/utils/utils.ts";

export enum FileTypeEnum {
  FILE = 0,
  IMAGE = 1,
  VIDEO = 2,
}

export interface PhotosphereFile {
  sourceBucketUri: string;
  sourceBucketThumbnailUri: string;
  fileType: FileTypeEnum;
  createdAtTimestamp: number;
  geohash: string;
  hash: string;
}

// Protobuf schema definition
const protoSchema = `
syntax = "proto3";

package photosphere;

enum FileType {
  FILE = 0;
  IMAGE = 1;
  VIDEO = 2;
}

message PhotosphereFile {
  string source_bucket_uri = 2;
  FileType file_type = 4;
  int64 created_at_timestamp = 6;
  string geohash = 9;
  string hash = 10;
}
`;

let root: protobuf.Root | null = null;
let PhotosphereFileMessage: protobuf.Type | null = null;

// Initialize protobuf types
async function initProtobuf() {
  if (root) return;

  root = protobuf.parse(protoSchema).root;
  PhotosphereFileMessage = root.lookupType('PhotosphereFile');
}

// Decode varint from buffer starting at offset
function decodeVarint(buffer: Uint8Array, offset: number): { value: number; bytesRead: number } {
  let value = 0;
  let shift = 0;
  let bytesRead = 0;

  while (offset + bytesRead < buffer.length) {
    const byte = buffer[offset + bytesRead];
    bytesRead++;

    value |= (byte & 0x7F) << shift;

    if ((byte & 0x80) === 0) {
      break;
    }

    shift += 7;
    if (shift >= 64) {
      throw new Error('Varint too long');
    }
  }

  return { value, bytesRead };
}

// Convert protobuf snake_case to camelCase
function convertToJsObject(protoObj: PhotosphereFile): PhotosphereFile {
  return {
    sourceBucketUri: protoObj.sourceBucketUri,
    sourceBucketThumbnailUri: convertSourceBucketUriToThumbnailUri(protoObj.sourceBucketUri, protoObj.hash),
    fileType: protoObj.fileType ?? FileTypeEnum.FILE,
    createdAtTimestamp: protoObj.createdAtTimestamp || 0,
    geohash: protoObj.geohash || '',
    hash: protoObj.hash || '',
  };
}

export async function decodePhotosphereFileBuffer(buffer: ArrayBuffer): Promise<PhotosphereFile[]> {
  await initProtobuf();

  if (!PhotosphereFileMessage) {
    throw new Error('Protobuf not initialized');
  }

  const uint8Array = new Uint8Array(buffer);
  const files: PhotosphereFile[] = [];
  let offset = 0;

  try {
    while (offset < uint8Array.length) {
      // Decode the length varint
      const { value: messageLength, bytesRead } = decodeVarint(uint8Array, offset);
      offset += bytesRead;

      // Check if we have enough bytes for the message
      if (offset + messageLength > uint8Array.length) {
        throw new Error('Incomplete message: not enough bytes');
      }

      // Extract the message bytes
      const messageBytes = uint8Array.slice(offset, offset + messageLength);
      offset += messageLength;

      // Decode the protobuf message
      const decoded = PhotosphereFileMessage.decode(messageBytes);
      const plain: PhotosphereFile = PhotosphereFileMessage.toObject(decoded, {
        longs: Number,
        enums: Number,
        bytes: String,
      }) as PhotosphereFile;

      files.push(convertToJsObject(plain));
    }

    return files;
  } catch (error) {
    throw new Error(`Failed to decode length-prefixed protobuf: ${error}`);
  }
}

export async function downloadAndDecodeProtobuf(url: string): Promise<PhotosphereFile[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    return await decodePhotosphereFileBuffer(buffer);
  } catch (error) {
    throw new Error(`Failed to download and decode protobuf: ${error}`);
  }
}
