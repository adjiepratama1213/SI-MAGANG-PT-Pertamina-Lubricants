import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import axiosInstance from 'src/utils/axios';
import { endpoints } from 'src/utils/endpoints';

export function useGenerateMFAQRCode({ id }: { id: string }) {
  const URL = `${endpoints.mfa.generate}`;

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['generateMFAQRCode', id],
    queryFn: async () => {
      const res = await axiosInstance.post(URL, { id });
      return res.data;
    },
    enabled: !!id, // Only fetch when id is available
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount if data exists
  });
  const memoizedValue = useMemo(
    () => ({
      results: (data as { qrcode?: string; secret?: string; type?: 'email'; message?: string }) || {},
      loading: isLoading,
      error,
      isFetching,
      empty: !isFetching && !data,
    }),
    [data, error, isLoading, isFetching]
  );

  return memoizedValue;
}

export function useCheckMfaDetail({ id }: { id: string }) {
  const URL = `${endpoints.mfa.ready}`;

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['useCheckMfaDetail', id],
    queryFn: async () => {
      const res = await axiosInstance.post(URL, { id });
      return res.data;
    },
  });
  const memoizedValue = useMemo(
    () => ({
      results: (data as { id: string; encryptedSecret: string }) || [],
      loading: isLoading,
      error,
      isFetching,
      empty: !isFetching && !data?.length,
    }),
    [data, error, isLoading, isFetching]
  );

  return memoizedValue;
}
