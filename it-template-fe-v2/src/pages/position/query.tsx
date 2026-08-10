import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { IPositionItem } from 'src/types/position';
import axiosInstance from 'src/utils/axios';
import { endpoints } from 'src/utils/endpoints';

type TOne = {
  id: string;
};

type TGetReqByTeam = {
  id?: number;
  take?: number;
  skip?: number;
  orderBy?: {};
  where?: {};
};

export function useGetPosition({ id }: TOne) {
  const URL = `${endpoints.position.list}/${id}`;

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['getPosition', id],

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

export function useSearchPosition({ id, skip, take, orderBy, where }: TGetReqByTeam) {
  const URL = `${endpoints.position.search}`;

  const { data, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ['getRequestByTeam', id, skip, take, orderBy, where],

    queryFn: async () => {
      const res = await axiosInstance.post(URL, { skip, take, orderBy, where });
      return res.data;
    },
  });

  const memoizedValue = useMemo(
    () => ({
      searchPositionResults: (data?.results as IPositionItem[]) || [],
      searchPositionLoading: isLoading,
      searchPositionError: error,
      searchPositionValidating: isFetching,
      searchPositionEmpty: !isLoading && !data?.results.length,
      searchPositionRefetch: refetch,
    }),
    [data?.results, error, isLoading, isFetching, refetch]
  );

  return memoizedValue;
}
