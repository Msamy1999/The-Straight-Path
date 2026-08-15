import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";

/** The mobile rendering of the primary Straight Path brand mark. */
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      fill="none"
      accessibilityRole="image"
      accessibilityLabel="The Straight Path logo"
    >
      <Defs>
        <LinearGradient id="mobileRoad" x1="64" y1="38" x2="64" y2="124">
          <Stop offset="0" stopColor="#17675F" stopOpacity={0.36} />
          <Stop offset="1" stopColor="#16756B" stopOpacity={0.88} />
        </LinearGradient>
        <LinearGradient id="mobileEdge" x1="64" y1="38" x2="64" y2="124">
          <Stop offset="0" stopColor="#FFFDF8" />
          <Stop offset="1" stopColor="#F1E7D8" />
        </LinearGradient>
        <ClipPath id="mobileFrameClip">
          <Rect x={4} y={4} width={120} height={120} rx={28} />
        </ClipPath>
      </Defs>

      <Rect x={4} y={4} width={120} height={120} rx={28} fill="#073D38" />
      <Circle cx={64} cy={30} r={23} fill="#E7B94A" opacity={0.1} />
      <Circle cx={64} cy={30} r={15.5} fill="#E7B94A" opacity={0.25} />
      <Circle cx={64} cy={30} r={9.5} fill="#E7B94A" opacity={0.65} />
      <Circle cx={64} cy={30} r={5.3} fill="#FFF9E9" />

      <G clipPath="url(#mobileFrameClip)">
        <Path d="M18 126L60.3 37.2Q64 33.2 67.7 37.2L110 126H18Z" fill="url(#mobileRoad)" />
        <Path d="M18 126L60 38L62.2 35.8L31 126H18Z" fill="url(#mobileEdge)" />
        <Path d="M97 126L65.8 35.8L68 38L110 126H97Z" fill="url(#mobileEdge)" />
        <Path d="M63.25 47.2L63.4 41.2H64.6L64.75 47.2H63.25Z" fill="#FFFDF8" />
        <Path d="M62.7 62.8L63 52.8H65L65.3 62.8H62.7Z" fill="#FFFDF8" />
        <Path d="M61.8 86.8L62.2 70.8H65.8L66.2 86.8H61.8Z" fill="#FFFDF8" />
        <Path d="M60.2 120.5L60.9 98H67.1L67.8 120.5H60.2Z" fill="#FFFDF8" />
      </G>
    </Svg>
  );
}
