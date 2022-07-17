import { Injectable, Logger } from '@nestjs/common';
import path from 'path';
import uniqueFilename from 'unique-filename';
import fs from 'fs';
import moment from 'moment';
import sharp from 'sharp';
import { s3 } from './aws.service';
import { GetS3UploadParamsDto } from './dto/get-s3-upload-url.dto';
import { S3_VIDEOS_PATH, TEMP_PATH } from 'src/config';
import ffmpeg, { FfprobeData } from 'fluent-ffmpeg';

@Injectable()
export class FileManagerService {
  private readonly logger = new Logger(FileManagerService.name);

  uploadFile({
    file,
    folder,
    allowPublic = false,
  }: {
    file: Express.Multer.File;
    folder: string;
    allowPublic?: boolean;
  }): string {
    const folderPath = this.getFolderPath({ folder, allowPublic });

    const fileName = file.originalname;

    const filePath = uniqueFilename(folderPath) + fileName;

    fs.writeFileSync(filePath, file.buffer);

    return filePath;
  }

  async uploadImageAsJpg({
    file,
    folder,
    allowPublic = false,
  }: {
    file: Express.Multer.File;
    folder: string;
    allowPublic?: boolean;
  }): Promise<string> {
    const folderPath = this.getFolderPath({ folder, allowPublic });

    const fileName = path.parse(file.originalname).name;

    const filePath = uniqueFilename(folderPath, fileName) + '.jpg';

    await sharp(file.buffer).jpeg({ quality: 80 }).toFile(filePath);

    return filePath;
  }

  async uploadAvatarAsJPG({
    file,
    folder,
    allowPublic = false,
  }: {
    file: Express.Multer.File;
    folder: string;
    allowPublic?: boolean;
  }): Promise<string> {
    const folderPath = this.getFolderPath({ folder, allowPublic });

    const fileName = path.parse(file.originalname).name;

    const filePath = uniqueFilename(folderPath, fileName) + '.jpg';

    await sharp(file.buffer)
      .resize({ width: 128, height: 128 })
      .jpeg({ quality: 80 })
      .toFile(filePath);

    return filePath;
  }

  async convertAndSaveVideoAsMp4({
    inputFilePath,
    outputFilename,
    outputFolder,
    allowPublic = false,
  }: {
    inputFilePath: string;
    outputFolder: string;
    outputFilename: string;
    allowPublic?: boolean;
  }): Promise<string> {
    const folderPath = this.getFolderPath({
      folder: outputFolder,
      allowPublic: allowPublic,
    });

    const filePath = path.join(folderPath, outputFilename);

    return new Promise((resolve, reject) => {
      ffmpeg(inputFilePath)
        .videoCodec('libx264')
        .size('1280x720')
        // // set video bitrate
        // .videoBitrate(1024)
        // // set target codec
        // // .videoCodec('divx')
        // // // set aspect ratio
        // .aspect('16:9')
        // // set size in percent
        // .size('50%')
        // // set fps
        // .fps(24)
        // // set audio bitrate
        // .audioBitrate('128k')
        // // set audio codec
        // .audioCodec('libmp3lame')
        // // set number of audio channels
        // .audioChannels(2)
        // // set custom option
        // .addOption('-vtag', 'DIVX')
        // // set output format to force
        .format('mp4')
        // setup event handlers
        .on('end', () => {
          this.logger.log(`Convert file to ${filePath} successfully`);

          resolve(filePath);
        })
        // .on('progress', (progress) => {
        //   console.log(progress.percent);
        // })
        .on('error', () => {
          reject(new Error('Cannot convert file'));
        })
        // save to file
        .save(filePath);
    });

    // const fileName = path.parse(file.originalname).name;

    // const uniqueFilename = v4;

    // const filePath = uniqueFilename(folderPath, fileName) + '.jpg';

    // await sharp(file.buffer)
    //   .resize(1000)
    //   .jpeg({ quality: 80 })
    //   .toFile(filePath);

    return filePath;
  }

  getVideoInformation(videoPath: string): Promise<FfprobeData> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(err);
        }

        resolve(metadata);
      });
    });
  }

  async getS3UploadURL(getS3UploadParamsDto: GetS3UploadParamsDto) {
    const { filename, fileType } = getS3UploadParamsDto;

    const parseFile = path.parse(filename);

    const filePath =
      uniqueFilename(S3_VIDEOS_PATH, parseFile.name) + parseFile.ext;

    const uploadURL = await s3.getSignedUrlPromise('putObject', {
      Bucket: process.env.AWS_BUCKET_NAME,
      Expires: 3600,
      Key: filePath,
      ContentType: fileType,
      ACL: 'public-read',
    });

    return {
      uploadURL,
      videoURL: filePath,
    };
  }

  async getS3FilePath(filePath: string) {
    const uploadURL = await s3.getSignedUrlPromise('getObject', {
      Bucket: process.env.AWS_BUCKET_NAME,
      Expires: 3600,
      Key: filePath,
      // ResponseContentDisposition: `attachment; filename="filename.ext"`,
    });

    return uploadURL;
  }

  removeFile(filePath: string) {
    if (this.isInvalidPath(filePath)) {
      return;
    }

    return fs.rmSync(filePath, {
      force: true,
    });
  }

  moveFileToTemp(filePath: string) {
    try {
      if (!fs.existsSync(TEMP_PATH)) {
        fs.mkdirSync(TEMP_PATH);
      }

      if (this.isInvalidPath(filePath)) {
        return;
      }

      const parseFilePath = path.parse(filePath);

      const filename = parseFilePath.name + parseFilePath.ext;

      const outputPath = `${TEMP_PATH}/${filename}`;

      fs.renameSync(filePath, outputPath);

      this.logger.log(
        `Move file from ${filePath} to ${outputPath} successfully`,
      );

      return;
    } catch (err) {
      err?.message && this.logger.warn('Cannot delete file', err.message);
    }
  }

  getFolderPath({
    folder,
    allowPublic = false,
  }: {
    folder: string;
    allowPublic?: boolean;
  }) {
    if (this.isInvalidPath(folder)) {
      throw new Error('Không đúng đường dẫn file!');
    }

    const startPath = allowPublic ? 'public/uploads/' : 'private/uploads/';

    const folderPath = path.join(
      startPath,
      folder,
      moment().format('YYYY-MM-DD'),
    );

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    return `./${folderPath}`;
  }

  getFilePath({
    folder,
    filename,
    allowPublic,
  }: {
    folder: string;
    filename: string;
    allowPublic: boolean;
  }) {
    const folderPath = this.getFolderPath({
      folder: folder,
      allowPublic: false,
    });

    return path.join();
  }

  isInvalidPath(fp) {
    if (fp === '' || typeof fp !== 'string') return true;

    const rootPath = path.parse(fp).root;

    if (rootPath) fp = fp.slice(rootPath.length);

    return /[<>:"|?*]/.test(fp);
  }
}
