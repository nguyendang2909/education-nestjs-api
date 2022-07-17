export const ACCESS_TOKEN_COOKIE = 'access_token';

export const MAX_UPLOAD_FILE_SIZE = 10 * 1024 * 1024;

export const MAX_UPLOAD_VIDEO_FILE_SIZE = 100 * 1024 * 1024;

export const PUBLIC_ENDPOINT_METADATA = 'isPublic';

export const ALLOW_PUBLIC_ENDPOINT_METADATA = 'isAllowPublic';

export const S3_VIDEOS_PATH = 'videos';

export const TEMP_PATH = 'public/temp';

export const RABBITMQ_VIDEO_TRANSCODE_EXCHANGE =
  process.env.RABBITMQ_VIDEO_TRANSCODE_EXCHANGE || 'video-transcode';

export const RABBITMQ_VIDEO_TRANSCODE_QUEUE =
  process.env.RABBITMQ_LESSON_VIDEO_TRANSCODE_QUEUE || 'video-transcode';

export const RABBITMQ_VIDEO_TRANSCODE_ROUTING_KEY =
  process.env.RABBITMQ_LESSON_VIDEO_TRANSCODE_ROUTING_KEY || 'video-transcode';

export const UI_URL = process.env.UI_URL;

export const DB_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export const VN_DATE_FORMAT = 'DD/MM/YYYY';

export const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD';
