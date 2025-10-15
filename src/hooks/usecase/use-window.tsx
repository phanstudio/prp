// import { useEffect, useState } from "react"

// type WindowSize = {
//   width: number | undefined
//   height: number | undefined
// }

// type WindowDimensions = {
//   windowSize: WindowSize
//   isMobile: boolean
//   isDesktop: boolean
// }

// export function useWindow(): WindowDimensions {
//   const [windowSize, setWindowSize] = useState<WindowSize>({
//     width: undefined,
//     height: undefined,
//   })

//   useEffect(() => {
//     const handleResize = () => {
//       setWindowSize({
//         width: window.innerWidth,
//         height: window.innerHeight,
//       })
//     }

//     window.addEventListener("resize", handleResize)
//     handleResize()

//     return () => window.removeEventListener("resize", handleResize)
//   }, [])

//   const isMobile: boolean =
//     typeof windowSize.width === "number" && windowSize.width < 768
//   const isDesktop: boolean =
//     typeof windowSize.width === "number" && windowSize.width >= 768

//   return { windowSize, isMobile, isDesktop }
// }


import { useEffect, useState } from "react"

type WindowSize = {
  width: number | undefined
  height: number | undefined
}

type WindowDimensions = {
  windowSize: WindowSize
  isMobile: boolean
  isDesktop: boolean
}

export function useWindow(): WindowDimensions {
  const [windowSize, setWindowSize] = useState<WindowSize>(() => {
    // Initialize with actual window dimensions on mount
    // This ensures dimensions are available immediately
    if (typeof window !== 'undefined') {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      }
    }
    return {
      width: undefined,
      height: undefined,
    }
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // Only add listener, don't call handleResize since state is already initialized
    window.addEventListener("resize", handleResize)

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const isMobile: boolean =
    typeof windowSize.width === "number" && windowSize.width < 768
  const isDesktop: boolean =
    typeof windowSize.width === "number" && windowSize.width >= 768

  return { windowSize, isMobile, isDesktop }
}