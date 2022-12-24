import useSWR from "swr";

import { Category, Service } from "./types";

const fetcher = async (url: string) => {
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    window.location.href = process.env.REACT_APP_LOGIN_URL as string;
  }

  const res = await fetch(url, {
    mode: "cors",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    method: "GET",
  });
  if (res.status !== 200) {
    localStorage.removeItem("accessToken");
    return (window.location.href = process.env.REACT_APP_LOGIN_URL as string);
  }
  return res.json();
};

const poster = async (url: string, body: any) => {
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    window.location.href = process.env.REACT_APP_LOGIN_URL as string;
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    method: "POST",
    body: JSON.stringify(body),
  });
  return res;
};

const useApi = <T>(endpoint?: string) => {
  const { data, error } = useSWR<T>(
    endpoint ? `${process.env.REACT_APP_API_URL}/${endpoint}` : null,
    fetcher
  );

  return {
    data,
    error,
    loading: !data && !error,
  };
};

export const useServices = () => {
  return useApi<Service[]>("services");
};

export const useCategories = () => {
  return useApi<Category[]>("categories");
};

export const postService = (services: Service[]) => {
  return poster(`${process.env.REACT_APP_API_URL}/services`, { services });
};
