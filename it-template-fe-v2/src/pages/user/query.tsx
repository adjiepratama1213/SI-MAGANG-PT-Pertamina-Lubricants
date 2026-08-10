import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import axiosInstance from 'src/utils/axios';
import { endpoints } from 'src/utils/endpoints';

type TOne = {
  id: string;
};

export function useGetUser({ id }: TOne) {
  const URL = `${endpoints.user.list}/${id}`;

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['getUser', id],

    queryFn: async () => {
      const res = await axiosInstance.get(URL);
      return res.data;
    },

    enabled: !!id,
  });

  const memoizedValue = useMemo(
    () => ({
      results: data || {},
      loading: isLoading,
      error,
      isFetching,
      empty: !isFetching && !data,
    }),
    [data, error, isLoading, isFetching]
  );

  return memoizedValue;
}

export function useGetQr() {
  const URL = `${endpoints.auth.qrCreate}`;

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['getUserQr'],

    queryFn: async () => {
      const res = await axiosInstance.post(URL);
      return res.data;
    },

    enabled: true,
  });

  const memoizedValue = useMemo(
    () => ({
      results: data || {},
      loading: isLoading,
      error,
      isFetching,
      empty: !isFetching && !data,
    }),
    [data, error, isLoading, isFetching]
  );

  return memoizedValue;
}
