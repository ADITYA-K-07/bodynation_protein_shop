import { useEffect, useState } from "react";
import { getCatalog } from "../../js/catalog.js";

export function useCatalog() {
  const [state, setState] = useState({
    products: [],
    mode: "loading",
    error: null,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    getCatalog()
      .then((catalog) => {
        if (cancelled) {
          return;
        }
        setState({
          products: catalog.products,
          mode: catalog.mode,
          error: catalog.error || null,
          loading: false,
        });
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }
        setState({
          products: [],
          mode: "error",
          error,
          loading: false,
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
