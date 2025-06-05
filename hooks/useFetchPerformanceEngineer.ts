import axios from "axios";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export const useFetchPerformanceEngineer = () => {
  const { data, error, mutate } = useSWR(`/api/performance-engineer`, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    performanceEngineer: data || [],
    isLoading: !error && !data,
    error,
    mutate,
  };
};
