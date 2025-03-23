import { BASE_URL } from '../constants/constants';

const getFullUrl = function (url: string) {
  if (!url) return '';

  if (url.startsWith('http')) {
    return url;
  }

  return `${BASE_URL}${url}`;
};

export default getFullUrl;
