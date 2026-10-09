import { useEffect, useState } from "react";
import { Navigate, Outlet, useOutletContext } from "react-router";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthState = { status: "loading" } | { status: "signed-out" } | { status: "signed-in"; user: User };

export function RequireAuth() {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setState(data.user ? { status: "signed-in", user: data.user } : { status: "signed-out" });
    });
    return () => {
      active = false;
    };
  }, []);

  if (state.status === "loading") return null;
  if (state.status === "signed-out") return <Navigate to="/auth" replace />;
  return <Outlet context={{ user: state.user }} />;
}

export function useAuthUser() {
  return useOutletContext<{ user: User }>().user;
}
