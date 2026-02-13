export function CrtOverlay() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0 crt-scanlines" />
      <div className="pointer-events-none fixed inset-0 z-0 crt-vignette" />
    </>
  )
}
