import axios from "axios";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export const useFetchDashboard = () => {
  const { data, error, mutate } = useSWR(`/api/dashboard`, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    dashboard: data || [],
    isLoading: !error && !data,
    error,
    mutate,
  };
};
