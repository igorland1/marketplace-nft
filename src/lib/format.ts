import axios from 'axios';

export const eth = (v: string) => `${v} ETH`;

export function errorMessage(err: unknown, fallback = 'Algo deu errado. Tente novamente.') {
  if (axios.isAxiosError(err)) return (err.response?.data as { message?: string })?.message ?? fallback;
  return fallback;
}
