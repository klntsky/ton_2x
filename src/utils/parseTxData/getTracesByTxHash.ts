import { fetchWithAuth } from ".";
import { TTransaction } from "../../types";

// fetches traces to be parsed for us.
export const getTracesByTxHash = async (hash: string) => {
    const url = (
      'https://tonapi.io/v2/traces/' + hash
    );
  
    const traces: TTransaction = await (await fetchWithAuth(url)).json();
    return traces;
  };
  