"use client";
import { motion } from "framer-motion";
import { slideIn } from "@/design/tokens/motion";
export function SlideIn(p: any) {
 return <motion.div {...slideIn} {...p} />;
}
export default SlideIn;
