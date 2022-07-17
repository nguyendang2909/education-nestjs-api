import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { IAmqpConnectionManager } from 'amqp-connection-manager/dist/esm/AmqpConnectionManager';
import { Channel } from 'amqplib';
import {
  RABBITMQ_VIDEO_TRANSCODE_QUEUE,
  RABBITMQ_VIDEO_TRANSCODE_ROUTING_KEY,
  RABBITMQ_VIDEO_TRANSCODE_EXCHANGE,
} from 'src/config';
import { AdminCoursesService } from 'src/courses/admin-courses.service';
import { FileManagerService } from 'src/file-manager/file-manager.service';
import { AdminLessonsService } from 'src/lessons/admin-lessons.service';
import { VideoTranscodeConsumeData } from './schedules.type';

@Injectable()
export class SchedulesService {
  connection: IAmqpConnectionManager;

  private readonly logger = new Logger(SchedulesService.name);

  amqpChannel: ChannelWrapper;

  constructor(
    @Inject(forwardRef(() => AdminLessonsService))
    private readonly adminLessonsService: AdminLessonsService,
    @Inject(forwardRef(() => AdminCoursesService))
    private readonly adminCoursesService: AdminCoursesService,
    private readonly fileManagerService: FileManagerService,
  ) {
    this.connection = amqp.connect([process.env.RABBITMQ_URL as string]);

    this.connection.on('connect', () => {
      this.logger.log('Connect RabbitMQ successfully');
    });

    this.connection.on('disconnect', () => {
      this.logger.error('Disconnect from RabbitMQ. Reconnecting...');
    });

    this.connection.on('error', (err) => {
      this.logger.error(`AmqpConnectionManager Error: ${err.stack || err}`);
    });

    this.amqpChannel = this.connection.createChannel({
      name: 'video-transcoder',
      json: true,
      setup: async (channel: Channel) => {
        try {
          await channel.assertExchange(
            RABBITMQ_VIDEO_TRANSCODE_EXCHANGE,
            'direct',
            { durable: true },
          );

          await channel.assertQueue(RABBITMQ_VIDEO_TRANSCODE_QUEUE, {
            durable: true,
          });

          await channel.prefetch(1);

          await channel.bindQueue(
            RABBITMQ_VIDEO_TRANSCODE_QUEUE,
            RABBITMQ_VIDEO_TRANSCODE_EXCHANGE,
            RABBITMQ_VIDEO_TRANSCODE_ROUTING_KEY,
          );

          await channel.consume(RABBITMQ_VIDEO_TRANSCODE_QUEUE, async (msg) => {
            if (!msg) {
              return;
            }

            if (msg) {
              try {
                this.logger.log(
                  `Receiving video transcode request from queue ${RABBITMQ_VIDEO_TRANSCODE_QUEUE} and start transcode`,
                );

                const transcodeData: VideoTranscodeConsumeData = JSON.parse(
                  msg.content.toString(),
                );

                if (transcodeData.lessonId) {
                  await this.adminLessonsService.transcodeVideoToMp4(
                    transcodeData,
                  );
                } else if (transcodeData.courseId) {
                  await this.adminCoursesService.transcodeVideoToMp4(
                    transcodeData,
                  );
                }
              } catch (err) {
                this.logger.error(err);
              } finally {
                channel.ack(msg);
              }
            }
          });
        } catch (err) {}
      },
    });
  }
}
