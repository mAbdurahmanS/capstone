import axios from "axios";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export const useFetchPerformanceEngineer = (
  startDate?: string,
  endDate?: string
) => {
  const query =
    startDate && endDate ? `?start_date=${startDate}&end_date=${endDate}` : "";
  const { data, error, mutate } = useSWR(
    `/api/performance-engineer${query}`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    performanceEngineer: data || [],
    isLoading: !error && !data,
    error,
    mutate,
  };
};
