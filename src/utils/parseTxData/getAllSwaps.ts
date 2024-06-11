import { collectFromGenerator, parseTransactionSwaps } from ".";
import { TTransaction } from "../../types";

export const getAllSwaps = (tx: TTransaction) => {
    return collectFromGenerator(parseTransactionSwaps.bind(null, tx));
  };