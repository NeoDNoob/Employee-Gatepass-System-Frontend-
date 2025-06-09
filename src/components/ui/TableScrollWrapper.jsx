import React, { useRef, useEffect, useState } from "react"

export function TableScrollWrapper({ children }) {
  const topScrollRef = useRef(null)
  const bottomScrollRef = useRef(null)
  const tableRef = useRef(null)
  const [tableScrollWidth, setTableScrollWidth] = useState(0)

  // Measure the table's scroll width
  useEffect(() => {
    if (tableRef.current) {
      setTableScrollWidth(tableRef.current.scrollWidth)
    }
  }, [children])

  // Sync scroll positions
  useEffect(() => {
    const top = topScrollRef.current
    const bottom = bottomScrollRef.current
    if (!top || !bottom) return

    const handleTopScroll = () => {
      bottom.scrollLeft = top.scrollLeft
    }
    const handleBottomScroll = () => {
      top.scrollLeft = bottom.scrollLeft
    }

    top.addEventListener("scroll", handleTopScroll)
    bottom.addEventListener("scroll", handleBottomScroll)

    return () => {
      top.removeEventListener("scroll", handleTopScroll)
      bottom.removeEventListener("scroll", handleBottomScroll)
    }
  }, [])

  return (
    <div>
      {/* Top scrollbar */}
      <div
        ref={topScrollRef}
        style={{
          overflowX: "auto",
          overflowY: "hidden",
          height: 16,
          marginBottom: 4,
        }}
      >
        <div style={{ width: tableScrollWidth }} />
      </div>
      {/* Table with bottom scrollbar */}
      <div
        ref={bottomScrollRef}
        style={{
          overflowX: "auto",
          overflowY: "visible",
        }}
      >
        <div ref={tableRef} style={{ width: "fit-content", minWidth: "100%" }}>
          {children}
        </div>
      </div>
    </div>
  )
}
