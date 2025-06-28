declare module "probe-image-size" {
  interface ImageInfo {
    width: number
    height: number
    type: string
    mime: string
    length: number
    url: string
  }

  /**
   * Takes a Buffer or a readable stream and returns a Promise resolving to image info.
   */
  function probe(input: Buffer | string | import("stream").Readable): Promise<ImageInfo>

  export = probe
}
