import { HttpException, HttpStatus } from '@nestjs/common';
import { HTTPResponse } from './interface';

export const sendResponse = ({
  status = 'success',
  code = HttpStatus.OK,
  data = null,
  message = null,
}: HTTPResponse) => {
  if (status === 'success') {
    return {
      status,
      code,
      data,
      message,
    };
  } else {
    console.log('error message in sendResponse', message);
    console.log({
      message,
      status,
      code,
      data,
    });
    throw new HttpException(
      {
        message,
        statusCode: code,
        status,
        data,
      },
      code,
    );
  }
};
