import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import axiosInstance from 'src/utils/axios';
import { endpoints } from 'src/utils/endpoints';

type TOne = {
  teamId: string;
};

export function usePostGetClicks({ teamId }: TOne) {
  const URL = `${endpoints.dashboard.postClicks(teamId)}`;

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['usePostGetClicks', teamId],

    queryFn: async () => {
      const res = await axiosInstance.get(URL);
      return res.data;
    },

    enabled: !!teamId,
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

export function usePostGetClicksByAuthor({ teamId }: TOne) {
  const URL = `${endpoints.dashboard.postClicksByAuthor(teamId)}`;

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['usePostGetClicksByAuthor', teamId],

    queryFn: async () => {
      const res = await axiosInstance.get(URL);
      return res.data;
    },

    enabled: !!teamId,
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

export function usePostGetByAuthor({ teamId }: TOne) {
  const URL = `${endpoints.dashboard.postByAuthor(teamId)}`;

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['usePostGetByAuthor', teamId],

    queryFn: async () => {
      const res = await axiosInstance.get(URL);
      return res.data;
    },

    enabled: !!teamId,
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

export function usePostConversion({ teamId }: TOne) {
  const URL = `${endpoints.dashboard.postConversion(teamId)}`;

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['usePostConversion', teamId],

    queryFn: async () => {
      const res = await axiosInstance.get(URL);
      return res.data;
    },

    enabled: !!teamId,
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

export function usePostActiveMembers({ teamId }: TOne) {
  const URL = `${endpoints.dashboard.postActiveMembers(teamId)}`;

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['usePostActiveMembers', teamId],

    queryFn: async () => {
      const res = await axiosInstance.get(URL);
      return res.data;
    },

    enabled: !!teamId,
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

export function usePostGetClicksYearly({ teamId }: TOne) {
  const URL = `${endpoints.dashboard.postClicksYearly(teamId)}`;

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['usePostGetClicksYearly', teamId],

    queryFn: async () => {
      const res = await axiosInstance.get(URL);
      return res.data;
    },

    enabled: !!teamId,
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

export function useUserGetClicksYearly({ teamId }: TOne) {
  const URL = `${endpoints.dashboard.userClicksYearly(teamId)}`;

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['useUserGetClicksYearly', teamId],

    queryFn: async () => {
      const res = await axiosInstance.get(URL);
      return res.data;
    },

    enabled: !!teamId,
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
