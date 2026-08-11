export interface ImageItem {
  id: string
  file: File
  previewUrl: string
  rotation: number
}

export type CompressionLevel = 'low' | 'medium' | 'high'

export interface Settings {
  compression: CompressionLevel
  pageNumbers: boolean
  headerText: string
  watermark: boolean
}