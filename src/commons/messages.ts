export const Messages = {
  app: {
    hotline: '097-999-99-99',
    location: '247 Cầu Giấy, Hà Nội',
    phoneNumber: '0971016191',
    shortTitle: 'leslei',
    shortTitleDomain: 'leslei.com',
  },
  auth: {
    loginSuccess: 'đăng nhập thành công',
    loginRequire: 'yêu cầu đăng nhập',
    logoutSuccess: 'đăng xuất thành công',
  },
  cart: {
    name: 'giỏ hàng',
  },
  course: {
    lesson: 'bài học',
    name: 'khoá học',
    question: 'câu hỏi',
    videoIntroduction: 'video giới thiệu',
  },
  courseCategory: {
    name: 'chủ đề khoá học',
  },
  coursePart: {
    name: 'chương',
  },
  courseSubcategory: {
    name: 'chủ đề khoá học con',
  },
  order: {
    name: 'đơn hàng',
    payment: 'thanh toán',
  },
  statusCode: {
    403: 'bạn không có quyền truy cập',
  },
  user: {
    address: 'địa chỉ',
    birthday: 'sinh nhật',
    email: 'email',
    fullname: 'họ và tên',
    name: 'người dùng',
    oldPassword: 'mật khẩu cũ',
    password: 'mật khẩu',
    teacher: 'giảng viên',
  },
};

export const isPublish = 'isPublish';

class MessagesService {
  removeAccent(text: string) {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  }

  setText(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  replaceText(rawString: string, replacements: Record<string, string>) {
    const keys = Object.keys(replacements);

    let replacedString = rawString;

    for (const key of keys) {
      replacedString = replacedString.replace(`{${key}}`, replacements[key]);
    }

    return replacedString;
  }

  setReplaceText(rawString: string, replacements: Record<string, string>) {
    return this.setText(this.replaceText(rawString, replacements));
  }

  setNotFound(document?: string) {
    return `Không tìm thấy ${document || 'tài liệu'}`;
  }

  setWrong(document?: string) {
    return `Sai ${document || 'tài liệu'}`;
  }

  setConflict(document?: string) {
    return `Trùng ${document || 'tài liệu'}`;
  }
}

export const messagesService = new MessagesService();
