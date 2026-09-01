import { motion } from "framer-motion";

// a light scroll-in fade. respects prefers-reduced-motion through framer's
// own handling when the viewport already has the element in view.
export function FadeIn({ children, delay = 0, y = 16, className }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export default FadeIn;
