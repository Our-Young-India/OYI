import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Resets window scroll to top whenever the route pathname changes.
// React Router doesn't do this by default — without it, navigating from a
// scrolled position on one page to another lands you mid-page.
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}
