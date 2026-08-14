"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutUser, setUser } from "@/store/core/auth";
import { useRouter } from "next/navigation";
import fetcher, { axiosNoUser } from "@/lib/axios";

export function useAuth() {
  const [loading, loadingHandler] = useState(false);
  const [error, errorHandler] = useState<string | null>(null);
  const user_data = useAppSelector((store) => store.auth.data);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const loginUser = async (params: { username: string; password: string }) => {
    if (!params.username || !params.password) {
      errorHandler("لطفا نام کاربری و رمز عبور را به طور صحیح وارد کنید");
      return;
    }
    loadingHandler(true);
    errorHandler("");

    const default_jwt = process.env.NEXT_PUBLIC_JWT_KEY


    try {
      let access
      let refresh
      let user

      if (!default_jwt){
      const response = await axiosNoUser.post("login", params);

      //("status", response.status);
      //("OKOKOOKOKOKOKO");

      //("-->>", response.data);
      if (response.status !== 200) {
        throw new Error(response.data.error || "Login failed");
      }
      
      access = response.data.access
      refresh = response.data.refresh
      user = response.data.user

    } else {
      access = default_jwt
      refresh = default_jwt
      user = {

      }
    }

      // Store tokens in cookies (for middleware auth check)
      Cookies.set("accessToken", access, { expires: 7 }); // 7 days expiry
      Cookies.set("refreshToken", refresh, { expires: 14 });

      // Also store in localStorage as backup
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);
      localStorage.setItem("user", JSON.stringify(user));

      dispatch(setUser({ access, refresh, user }));

      //("Login successful, redirecting to Dashboard...");

      // // Force page reload to trigger middleware for redirection
      window.location.href = "/Dashboard";
    } catch (err: any) {
      console.error("Login error:", err);
      errorHandler(err.message || "An error occurred during login");
    } finally {
      loadingHandler(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        dispatch(setUser({
          access: localStorage.getItem("accessToken") || undefined,
          refresh: localStorage.getItem("refreshToken") || undefined,
          user: parsedUser,
        }));
      } catch (e) {
        // ignore parse errors
      }
    }
  }, [dispatch]);

  const logout = async () => {
    dispatch(logoutUser());
    router.push("/");
    const response = await fetcher.get("/auth/logout");
  };

  return {
    loginUser,
    user_data,
    loading,
    error,
    logout,
  };
}
