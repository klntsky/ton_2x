import { useMutation } from 'react-query';

const postData = async ({ url, data }: { url: string; data: object }) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('error posting data.');
  }

  return response.json();
};

export const usePostData = () => {
  return useMutation(postData);
};
