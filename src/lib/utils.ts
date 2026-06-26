export const ALBUM_PASSWORD = process.env.NEXT_PUBLIC_ALBUM_PASSWORD || 'gestante2024'

export function checkPassword(input: string): boolean {
  return input === ALBUM_PASSWORD
}
