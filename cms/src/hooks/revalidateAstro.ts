import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

const triggerRevalidate = async () => {
  const webhookUrl = process.env.ASTRO_DEPLOY_WEBHOOK
  if (!webhookUrl) return
  try {
    await fetch(webhookUrl, { method: 'POST' })
  } catch (err) {
    console.error('[revalidateAstro] Failed to trigger deploy webhook:', err)
  }
}

export const revalidateAstro: CollectionAfterChangeHook = triggerRevalidate
export const revalidateAstroOnDelete: CollectionAfterDeleteHook = triggerRevalidate
