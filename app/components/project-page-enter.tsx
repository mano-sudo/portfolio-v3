"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type ProjectPageEnterProps = {
  children: ReactNode;
};

export default function ProjectPageEnter({ children }: ProjectPageEnterProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
