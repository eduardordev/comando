import type { ChainDay } from '@comando/shared';
import type { CSSProperties } from 'react';

export function chainLinkStyle(day: ChainDay, index: number): CSSProperties {
  const base: CSSProperties = {
    width: 13,
    height: 25,
    borderRadius: 6,
    flexShrink: 0,
    transform: `translateY(${index % 2 === 0 ? 0 : 4}px)`,
  };

  if (day.completed) {
    return {
      ...base,
      background: '#FF4527',
      border: '2px solid #FF6B45',
      animation: 'cdGlow 2.4s ease-in-out infinite',
    };
  }

  if (day.isToday) {
    return {
      ...base,
      background: 'transparent',
      border: '2px dashed #F5B93F',
      animation: 'cdPulse 1.8s ease-in-out infinite',
    };
  }

  return {
    ...base,
    background: 'transparent',
    border: '2px solid #262B33',
  };
}
