"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const heroVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

export function HeroSection() {
  return (
    <motion.div
      variants={heroVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center gap-6 max-w-2xl"
    >
      <motion.h1
        variants={itemVariants}
        className="text-heading font-bold tracking-tight text-foreground leading-[1.1]"
      >
        Computer Recomendator
      </motion.h1>
      <motion.p
        variants={itemVariants}
        className="text-subhead font-medium text-muted-foreground leading-[1.3]"
      >
        Find the perfect laptop for your needs
      </motion.p>
      <motion.div variants={itemVariants} className="mt-4">
        <Link href="/quiz">
          <Button size="lg">Find My Laptop &rarr;</Button>
        </Link>
      </motion.div>
    </motion.div>
  );
}
