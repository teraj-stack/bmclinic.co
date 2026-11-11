---
name: mobile-app-animations-and-transitions
description: >-
  Use this skill when designing or implementing modern mobile app animations, shared-element
  transitions (View Transitions API & FLIP layout morphing), iOS 18/19 fluid spring physics,
  gesture-driven bottom sheets with rubber-banding and velocity projection, Dynamic Island morphing
  pills, scroll-driven animations, and haptic-synchronized micro-interactions in React, Next.js,
  React Native, or mobile web apps.
---

# Mobile App Fluid Animations & Shared-Element Transitions Skill (2026)

This skill codifies the mathematical physics, CSS/Web Animations API primitives, React/Next.js components, and gesture-driven state machines required to deliver native-grade **120Hz ProMotion mobile app transitions** across web and hybrid applications (`bmclinic.co`).

- **Spring Presets**:
  - *Snappy Pill/Tab*: `stiffness: 420, damping: 28, mass: 0.8`
  - *Fluid Shared-Element Card Morph*: `stiffness: 300, damping: 26, mass: 1.0`
  - *Spatial 3D Camera*: `stiffness: 180, damping: 22, mass: 1.2`
- **View Transitions API**: Wrap department filter changes, modal sheet expansions, and route transitions in `document.startViewTransition()` with shared `view-transition-name` identifiers.
- **Gesture-Driven Bottom Sheet**: Support swipe-to-dismiss, rubber-band over-drag ($d_{\text{rubber}} = \frac{d \cdot 0.55 \cdot R}{R + 0.55 \cdot |d|}$), velocity projection, and iOS background scale-back (`scale(0.95)`).
- **Dynamic Island & Floating Mobile Dock**: Provide expandable Live Activity telemetry pill at the top and a spring-animated floating Liquid Glass tab bar at the bottom.
- **Accessibility**: Synchronize subtle haptics (`navigator.vibrate`) and enforce `prefers-reduced-motion` / VI High-Contrast WCAG AAA fallbacks.
