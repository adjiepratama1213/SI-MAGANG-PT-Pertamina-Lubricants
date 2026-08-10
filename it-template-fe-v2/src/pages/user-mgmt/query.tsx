import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { toast } from 'react-toastify';
import { IUserItem } from 'src/types/user';
import axiosInstance from 'src/utils/axios';
import { endpoints } from 'src/utils/endpoints';

export function useSearchUsers(query: string) {
  const URL = `${endpoints.user.search}`;

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['getUserRequestByTeam', query],

    queryFn: async () => {
      const res = await axiosInstance.post(URL, query !== '' ? { query, take: 5000 } : { take: 5000 });
      return res.data;
    },
  });

  const memoizedValue = useMemo(
    () => ({
      userSearchData: (data?.results as IUserItem[]) || [],
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isFetching,
      searchEmpty: !isLoading && !data?.results.length,
    }),
    [data?.results, error, isLoading, isFetching]
  );

  return memoizedValue;
}

export function useGetUserDetail({ id }: { id: string }) {
  const URL = `${endpoints.user.details(id)}`;

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['getUserById', id],
    queryFn: async () => {
      const res = await axiosInstance.get(URL);
      return res.data;
    },
  });

  if (error) {
    toast.error(error.message);
  }

  const memoizedValue = useMemo(
    () => ({
      user: data || {},
      userLoading: isLoading,
      userError: error,
      isFetching,
      empty: !isFetching && !data,
    }),
    [data, error, isLoading, isFetching]
  );

  return memoizedValue;
}
