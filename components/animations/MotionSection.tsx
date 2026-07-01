"use client";
import { motion } from "framer-motion";
import { fadeInUp } from "@/design/tokens/motion";
import * as React from "react";
export function MotionSection({
 children,
 ...p
}: React.ComponentProps<typeof motion.section>) {
 return (
 <motion.section {...fadeInUp} {...p}>
 {children}
 </motion.section>
 );
}
export default MotionSection;
