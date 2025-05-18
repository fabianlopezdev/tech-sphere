import { z } from 'zod'

export const CarouselBannerPropsSchema = z
  .object({
    messages: z.array(z.string()).optional(),
    separator: z.string().optional(),
  })
  .passthrough()

export type CarouselBannerProps = z.infer<typeof CarouselBannerPropsSchema>

export const SubtitlePropsSchema = z
  .object({
    text: z.string().optional(),
    className: z.string().optional(),
  })
  .passthrough()

export type SubtitleProps = z.infer<typeof SubtitlePropsSchema>

export const TitleWithPreloaderPropsSchema = z
  .object({
    title: z.string().optional(),
    showPreloader: z.boolean().optional(),
    className: z.string().optional(),
  })
  .passthrough()

export type TitleWithPreloaderProps = z.infer<typeof TitleWithPreloaderPropsSchema>
