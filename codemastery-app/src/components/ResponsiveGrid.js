import React from "react"
import { View, StyleSheet } from "react-native"
import useResponsive from "../hooks/useResponsive"

const ResponsiveGrid = ({ children, numColumns, style }) => {
  const { isTablet, orientation, spacing } = useResponsive()

  // Determine columns based on device and orientation
  const getColumns = () => {
    if (numColumns) return numColumns
    if (isTablet) {
      return orientation === "landscape" ? 3 : 2
    }
    return orientation === "landscape" ? 2 : 1
  }

  const columns = getColumns()

  const gridStyle = [
    styles.grid,
    {
      paddingHorizontal: spacing.sm,
    },
    style,
  ]

  return (
    <View style={gridStyle}>
      <View style={styles.row}>
        {React.Children.map(children, (child, index) => (
          <View
            key={index}
            style={[
              styles.column,
              {
                width: `${100 / columns}%`,
                paddingHorizontal: spacing.xs,
              },
            ]}
          >
            {child}
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  column: {
    marginBottom: 8,
  },
})

export default ResponsiveGrid
