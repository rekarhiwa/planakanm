import Svg, { Circle, Path } from 'react-native-svg';

const STROKE = 1.75;

interface AppIconProps {
  name: 'Search';
  color: string;
  size?: number;
}

export function AppIcon({ name, color, size = 22 }: AppIconProps) {
  if (name === 'Search') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx={11} cy={11} r={6.5} stroke={color} strokeWidth={STROKE} />
        <Path
          d="M16 16l4.5 4.5"
          stroke={color}
          strokeWidth={STROKE}
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  return null;
}
