"use client";

import { LazyMotion, MotionConfig, domAnimation, m } from "motion/react";

/**
 * Section entrance: fade + 8px slide-up, 0.4s, once (BUILD_PLAN Section 1).
 * With reduced motion the slide is dropped and only the fade remains.
 * Don't wrap above-the-fold content: it starts hidden and would delay LCP.
 */
export function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <m.div
          className={className}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -60px 0px" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {children}
        </m.div>
      </MotionConfig>
    </LazyMotion>
  );
}
