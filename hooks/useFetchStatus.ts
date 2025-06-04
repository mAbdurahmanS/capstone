import axios from "axios";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export const useFetchStatus = (id?: number | null) => {
  const { data, error, mutate } = useSWR(
    id ? `/api/status/${id}` : `/api/status`,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    statuses: data || [],
    isLoading: !error && !data,
    error,
    mutate,
  };
};
