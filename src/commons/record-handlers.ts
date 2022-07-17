import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateResult } from 'typeorm';
import { messagesService } from './messages';

export const handleFindOne = (result: any, document?: string) => {
  if (!result) {
    throw new NotFoundException(messagesService.setNotFound(document));
  }

  return result;
};

export const handleUpdateOne = (result: UpdateResult, document?: string) => {
  if (!result.affected) {
    throw new BadRequestException(
      `Cập nhật ${document || ''} không thành công. Vui lòng thử lại.`,
    );
  }

  return {
    message: `Cập nhật ${document || ''} thành công.`,
  };
};

export const handleDeleteOne = (result: UpdateResult, document?: string) => {
  if (!result.affected) {
    throw new BadRequestException(
      `Xoá ${document || 'tài liệu'} không thành công. Vui lòng thử lại.`,
    );
  }

  return {
    message: `Xoá ${document || ''} thành công.`,
  };
};
