import React from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useTheme } from "@core/store/ThemeContext";

interface ShimmerProps {
  count?: number; // Number of skeleton lines
  height?: number; // Height of each skeleton block
  width?: string | number; // Width of skeleton block
  circle?: boolean; // For circular skeletons
  rows?: number; // Useful for tables or lists
  style?: React.CSSProperties; // Custom inline styles
}

const Shimmer: React.FC<ShimmerProps> = ({
  count = 1,
  height = 20,
  width = "100%",
  circle = false,
  rows = 1,
  style = {},
}) => {
  const { theme } = useTheme();

  // Colors for light mode
  const lightBaseColor = "#e2e8f0";
  const lightHighlightColor = "#f1f5f9";
  
  // Colors for dark mode - using text-gray-700 (#374151) and slightly lighter for highlight
  const darkBaseColor = "#374151"; // text-gray-700 equivalent
  const darkHighlightColor = "#4b5563"; // text-gray-600 equivalent for highlight

  const baseColor = theme === "dark" ? darkBaseColor : lightBaseColor;
  const highlightColor = theme === "dark" ? darkHighlightColor : lightHighlightColor;

  return (
    <SkeletonTheme baseColor={baseColor} highlightColor={highlightColor}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index}  style={{ marginBottom: "10px", ...style }}>
          <Skeleton
            count={count}
            height={height}
            width={width}
            circle={circle}
            style={{ borderRadius: "8px" }}
          />
        </div>
      ))}
    </SkeletonTheme>
  );
};

export default Shimmer;
