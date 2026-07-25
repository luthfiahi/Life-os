'use client'

import {
  Wallet,
  Target,
  Calendar,
  Dumbbell,
  BookOpen,
  Brain,
  Bot,
  BarChart3,
  Heart,
  PlusCircle,
  CheckCircle2,
  FileText,
  Crosshair,
  PenLine,
  MessageCircle,
  Receipt,
  PieChart,
  Flame,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Sparkles,
  Lightbulb,
  Zap,
  type LucideIcon,
} from 'lucide-react'

/**
 * Icon registry — resolves icon name strings from mock data
 * to actual Lucide icon components.
 * Keeps mock data serializable (no component references).
 */
const iconMap: Record<string, LucideIcon> = {
  Wallet,
  Target,
  Calendar,
  Dumbbell,
  BookOpen,
  Brain,
  Bot,
  BarChart3,
  Heart,
  PlusCircle,
  CheckCircle2,
  FileText,
  Crosshair,
  PenLine,
  MessageCircle,
  Receipt,
  PieChart,
  Flame,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Sparkles,
  Lightbulb,
  Zap,
}

export function resolveIcon(name: string): LucideIcon {
  return iconMap[name] || Sparkles
}

export function resolveTrendIcon(trend: 'up' | 'down' | 'stable') {
  switch (trend) {
    case 'up':
      return TrendingUp
    case 'down':
      return TrendingDown
    case 'stable':
      return Minus
  }
}
