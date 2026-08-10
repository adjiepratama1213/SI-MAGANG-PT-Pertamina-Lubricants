import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { toast } from 'react-toastify';
import { ITeamItem } from 'src/types/team';
import axiosInstance from 'src/utils/axios';
import { endpoints } from 'src/utils/endpoints';

type TOne = {
  id: string;
};

export function useGetTeam({ id }: TOne) {
  const URL = `${endpoints.team.list}/${id}`;

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['getTeam', id],

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

export function useSearchTeams(query: any) {
  const URL = `${endpoints.team.search}`;

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['getTeamRequestByTeam', { query }],

    queryFn: async () => {
      const res = await axiosInstance.post(URL, query);
      return res.data;
    },
  });

  const memoizedValue = useMemo(
    () => ({
      teamSearchData: (data?.results as ITeamItem[]) || [],
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isFetching,
      searchEmpty: !isLoading && !data?.results.length,
    }),
    [data?.results, error, isLoading, isFetching]
  );

  return memoizedValue;
}

export function useSearchTeamsWithuser(query: any) {
  const URL = `${endpoints.team.searchWithUser}`;

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['getSearchTeamsWithuser', { query }],

    queryFn: async () => {
      const res = await axiosInstance.post(URL, query);
      return res.data;
    },
  });

  const memoizedValue = useMemo(
    () => ({
      teamSearchData: (data?.results as ITeamItem[]) || [],
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isFetching,
      searchEmpty: !isLoading && !data?.results.length,
    }),
    [data?.results, error, isLoading, isFetching]
  );

  return memoizedValue;
}

export function useGetTeamDetail({ id }: { id: string }) {
  const URL = `${endpoints.post.request}/${id}`;

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['getTeamById', id],
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
      post: data || {},
      postLoading: isLoading,
      postError: error,
      isFetching,
      empty: !isFetching && !data,
    }),
    [data, error, isLoading, isFetching]
  );

  return memoizedValue;
}
