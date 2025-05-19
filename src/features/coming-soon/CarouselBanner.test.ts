import { experimental_AstroContainer as AstroContainer } from 'astro/container'
import { expect, test, describe } from 'vitest'
import CarouselBanner from './CarouselBanner.astro'
import enTranslations from '../../i18n/en.json'
import esTranslations from '../../i18n/es.json'
import caTranslations from '../../i18n/ca.json'
import type { Locale } from '@shared/utils/i18n/types'

// Helper function to get translations based on locale for clarity in tests
const getExpectedTranslations = (locale: Locale) => {
  if (locale === 'es') return esTranslations
  if (locale === 'ca') return caTranslations
  return enTranslations
}

describe('CarouselBanner Component', () => {
  test('renders correctly with English locale and default props', async () => {
    const locale: Locale = 'en'
    const expected = getExpectedTranslations(locale)
    const container = await AstroContainer.create()

    const result = await container.renderToString(CarouselBanner, {
      props: { locale },
    })

    expect(result).toContain(expected.carouselBanner.defaultMessages.message1)
    expect(result).toContain(expected.carouselBanner.defaultMessages.message2)
    expect(result).toContain(expected.carouselBanner.defaultMessages.message3)
    expect(result).toContain(expected.carouselBanner.tooltip)
  })

  test('renders correctly with Spanish locale and default props', async () => {
    const locale: Locale = 'es'
    const expected = getExpectedTranslations(locale) // Will use English strings as placeholders
    const container = await AstroContainer.create()
    const result = await container.renderToString(CarouselBanner, { props: { locale } })

    expect(result).toContain(expected.carouselBanner.defaultMessages.message1)
    expect(result).toContain(expected.carouselBanner.tooltip)
  })

  test('renders correctly with Catalan locale and default props', async () => {
    const locale: Locale = 'ca'
    const expected = getExpectedTranslations(locale) // Will use English strings as placeholders
    const container = await AstroContainer.create()
    const result = await container.renderToString(CarouselBanner, { props: { locale } })

    expect(result).toContain(expected.carouselBanner.defaultMessages.message1)
    expect(result).toContain(expected.carouselBanner.tooltip)
  })

  test('renders correctly with custom messages', async () => {
    const locale: Locale = 'en'
    const customMessages = [
        { title: 'Custom Title 1', description: 'Custom Desc 1' },
        { title: 'Custom Title 2', description: 'Custom Desc 2' }
    ]
    const container = await AstroContainer.create()
    const result = await container.renderToString(CarouselBanner, {
      props: { locale, messages: customMessages },
    })

    expect(result).toContain('Custom Title 1')
    expect(result).toContain('Custom Desc 1')
    expect(result).toContain('Custom Title 2')
    expect(result).toContain('Custom Desc 2')
  })
})
