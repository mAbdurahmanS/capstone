import axios from "axios";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export const useAuth = () => {
  const { data, error, mutate, isLoading } = useSWR(`/api/auth/me`, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    user: data?.user ?? null,
    isLoading,
    error,
    mutate,
    isAdmin: data?.user?.role?.id === 1,
    isEngineer: data?.user?.role?.id === 2,
    isUser: data?.user?.role?.id === 3,
  };
};
