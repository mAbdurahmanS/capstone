import axios from "axios";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export const useFetchCategories = (id?: number | null) => {
  const { data, error, mutate } = useSWR(
    id ? `/api/categories/${id}` : `/api/categories`,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    categories: data || [],
    isLoading: !error && !data,
    error,
    mutate,
  };
};
