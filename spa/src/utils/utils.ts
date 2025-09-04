export const convertToValidJsonObj = (strJson: string) => {
  const validJsonString = strJson.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
  return JSON.parse(validJsonString);
}

export const convertTimestampToDayMonthYear = (timestamp: number): {
  day: number;
  month: number;
  year: number;
} => {
  const date = new Date(timestamp);
  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear()
  }
}

export const convertSourceBucketUriToThumbnailUri = (sourceBucketUri: string, hash: string): string => {
  if (!sourceBucketUri) return '';
  const fileName = sourceBucketUri.split('/').pop();
  const extension = fileName?.split('.').pop();
  const bucketBaseUrl = sourceBucketUri.match(/^(gs:\/\/[^\/]+)/);
  if (!fileName || !extension || !bucketBaseUrl || !bucketBaseUrl[1]) return '';
  return `${bucketBaseUrl[1]}/thumbnails/${fileName}.${hash}.thumbnail.jpg`;
}

export const getDateStringWithoutTime = (date: Date): string => {
  return date.toISOString().split('T')[0];
}
