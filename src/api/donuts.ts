import { useQuery } from '@tanstack/react-query';
import type { Donut } from './types/donut';

// Fetch function to get donuts
const fetchDonuts = async (): Promise<Donut[]> => {
  const response = await fetch('/donuts.json');
  if (!response.ok) {
    throw new Error('Failed to fetch donuts');
  }
  return response.json();
};

// Custom hook to fetch donuts
export const useDonuts = () => {
  return useQuery({
    queryKey: ['donuts'],
    queryFn: fetchDonuts,
  });
};