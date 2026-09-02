import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

// fades and lifts each portal screen in as you move between routes. keyed on the
// path so every navigation replays it. no exit animation, that keeps it snappy
// with lazy loaded pages.
export function PageTransition({ children }) {
  const { pathname } = useLocation();
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;
