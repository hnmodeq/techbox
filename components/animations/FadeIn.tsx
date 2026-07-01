"use client";
import { motion, type HTMLMotionProps } from "framer-motion";
import { fadeIn } from "@/design/tokens/motion";
type Props = HTMLMotionProps<"div"> & { children: React.ReactNode };
export function FadeIn({ children, ...rest }: Props){
 return <motion.div {...fadeIn} {...rest}>{children}</motion.div>;
}
export default FadeIn;
