export const ALBUM_PASSWORD = process.env.NEXT_PUBLIC_ALBUM_PASSWORD || 'karinegestante2026'

export function checkPassword(input: string): boolean {
  return input === ALBUM_PASSWORD
}
