import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const res = await fetch(queryKey[0] as string);
        if (!res.ok) {
          if (res.status >= 500) {
            throw new Error(`${res.status}: ${res.statusText}`);
          }
          throw new Error(`${res.status}: ${await res.text()}`);
        }
        return res.json();
      },
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error) => {
        console.error("Mutation error:", error);
      },
    },
  },
});

type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiRequest(
  url: string,
  method: RequestMethod = "GET",
  data?: unknown
) {
  const options: RequestInit = {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
  };

  const res = await fetch(url, options);

  if (!res.ok) {
    if (res.status >= 500) {
      throw new Error(`${res.status}: ${res.statusText}`);
    }

    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }

  if (res.status === 204) {
    return null;
  }

  return res.json();
}
