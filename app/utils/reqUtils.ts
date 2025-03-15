import axios from 'axios';
import { BASE_URL, TIMEOUT_SEC } from '../constants/constants';
import Cookies from 'js-cookie';

async function makePostReq(
  resource: string,
  e: React.FormEvent<HTMLFormElement>
) {
  try {
    const reqUrl = `${BASE_URL}/${resource}`;

    const response = await axios.post(reqUrl, e.currentTarget, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Cookies.get('accessToken')}`
      },
      signal: AbortSignal.timeout(TIMEOUT_SEC * 1000)
    });

    return {
      isSuccess: true,
      data: response.data,
      message: 'Success'
    };
  } catch (err) {
    let errorMessage = 'An unexpected error occurred.';

    if (axios.isAxiosError(err)) {
      errorMessage = err.response?.data?.message || err.message || errorMessage;
    }

    return {
      isSuccess: false,
      message: errorMessage
    };
  }
}

export { makePostReq };
