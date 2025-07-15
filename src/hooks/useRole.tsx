import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type AppRole = "super_admin" | "user";

export const useRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setRole(null);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching user role:", error);
          setRole("user"); // Default to user role
        } else {
          setRole(data.role as AppRole);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        setRole("user"); // Default to user role
      } finally {
        setIsLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  const isSuperAdmin = role === "super_admin";
  const isUser = role === "user";

  return {
    role,
    isSuperAdmin,
    isUser,
    isLoading,
  };
};