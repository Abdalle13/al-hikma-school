import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// scroll back to the top on every route change
export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default ScrollToTop;
