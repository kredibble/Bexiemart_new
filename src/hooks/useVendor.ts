import type { Product } from "@/types";

export function useVendorProducts(): {
  data: Product[];
  isLoading: boolean;
} {
  return {
    data: [],
    isLoading: false,
  };
}
