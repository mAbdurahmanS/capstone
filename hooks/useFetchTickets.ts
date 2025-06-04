import axios from "axios";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export const useFetchTickets = (id?: number | null) => {
  const { data, error, mutate } = useSWR(
    id ? `/api/tickets/${id}` : `/api/tickets`,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    tickets: data || [],
    isLoading: !error && !data,
    error,
    mutate,
  };
};
