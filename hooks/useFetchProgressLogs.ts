import axios from "axios";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export const useFetchProgressLogs = (
  ticketId: number,
  userId?: number | null
) => {
  let endpoint = "/api/progress-logs";

  if (ticketId) {
    endpoint = `/api/progress-logs/${ticketId}`;
  } else if (ticketId && userId) {
    endpoint = `/api/progress-logs/${ticketId}/${userId}`;
  }

  const { data, error, mutate } = useSWR(endpoint, fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 2000,
  });

  return {
    progressLogs: data || [],
    isLoading: !error && !data,
    error,
    mutate,
  };
};
