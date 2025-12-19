import { Tables } from "@/types/supabase";
import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";

// Type Machine depuis Supabase
type Machine = Tables<"machines">;

// Hook pour récupérer une machine spécifique par son QR code
export function useMachine(qrCode: string | null) {
  const [machine, setMachine] = useState<Machine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!qrCode) {
      setLoading(false);
      return;
    }

    async function fetchMachine() {
      setLoading(true);
      setError(null);

      if(!qrCode) {
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("machines")
        .select("*")
        .eq("qr_code_id", qrCode)
        .single();

        

      if (fetchError) {
        setError(fetchError.message);
        setMachine(null);
      } else {
        setMachine(data);
      }

      setLoading(false);
    }

    fetchMachine();
  }, [qrCode]);

  return { machine, loading, error };
}

// Hook pour récupérer toutes les machines
export function useMachines() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMachines() {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("machines")
        .select("*");

      if (fetchError) {
        setError(fetchError.message);
        setMachines([]);
      } else {
        setMachines(data || []);
      }

      setLoading(false);
    }

    fetchMachines();
  }, []);

  return { machines, loading, error };
}
