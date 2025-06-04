import axios from "axios";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export const useFetchUsers = (id?: number | null, roleId?: number | null) => {
  let endpoint = "/api/users";

  if (id) {
    endpoint = `/api/users/${id}`;
  } else if (roleId) {
    endpoint = `/api/users/role/${roleId}`;
  }

  const { data, error, mutate } = useSWR(endpoint, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    users: data || [],
    isLoading: !error && !data,
    error,
    mutate,
  };
};
