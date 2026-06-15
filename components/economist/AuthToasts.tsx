"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { toast } from "sonner";

const AUTH_STATUS_KEY = "economist-auth-status";

const AuthToasts = () => {
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const nextStatus = isSignedIn ? "signed-in" : "signed-out";
    const previousStatus = window.sessionStorage.getItem(AUTH_STATUS_KEY);

    if (previousStatus && previousStatus !== nextStatus) {
      toast.success(
        isSignedIn ? "Signed in successfully" : "Signed out successfully",
        {
          description: isSignedIn
            ? `Welcome${user?.firstName ? `, ${user.firstName}` : ""}.`
            : "Your study library is secure.",
        }
      );
    }

    window.sessionStorage.setItem(AUTH_STATUS_KEY, nextStatus);
  }, [isLoaded, isSignedIn, user?.firstName]);

  return null;
};

export default AuthToasts;
