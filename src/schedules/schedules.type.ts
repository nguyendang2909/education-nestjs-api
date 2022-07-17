export type VideoTranscodePublishData = {
  inputFilePath: string;
  outputFolder: string;
  outputFilename: string;
  lessonId?: number;
  courseId?: number;
};

export type VideoTranscodeConsumeData = Partial<VideoTranscodePublishData>;
