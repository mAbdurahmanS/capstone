import axios from "axios";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export const useFetchPriorities = (id?: number | null) => {
  const { data, error, mutate } = useSWR(
    id ? `/api/priorities/${id}` : `/api/priorities`,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    priorities: data || [],
    isLoading: !error && !data,
    error,
    mutate,
  };
};
