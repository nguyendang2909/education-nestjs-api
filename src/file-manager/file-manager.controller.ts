import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetStreamVideoDto } from './dto/get-stream-video.dto';
import { FileManagerService } from './file-manager.service';
import fs from 'fs';
import { Request, Response } from 'express';

@Controller('file-manager')
@ApiTags('file-manager')
export class FileManagerController {
  constructor(private readonly fileManagerService: FileManagerService) {}

  @Get('stream-video')
  streamVideo(
    @Query() getStreamVideoDto: GetStreamVideoDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const videoPath = getStreamVideoDto.path;

    const videoStat = fs.statSync(videoPath);

    const fileSize = videoStat.size;

    const videoRange = req.headers.range;

    if (videoRange) {
      const parts = videoRange.replace(/bytes=/, '').split('-');

      const start = parseInt(parts[0], 10);

      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      const chunksize = end - start + 1;

      const file = fs.createReadStream(videoPath, { start, end });

      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(206, head);

      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(200, head);

      fs.createReadStream(videoPath).pipe(res);
    }
  }
}
