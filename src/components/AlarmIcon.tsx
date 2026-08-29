import Svg, { Circle, Path } from 'react-native-svg';

const STROKE = 1.75;

interface AlarmIconProps {
  color: string;
  size?: number;
}

export function AlarmIcon({ color, size = 22 }: AlarmIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={13} r={7.5} stroke={color} strokeWidth={STROKE} />
      <Path
        d="M12 10v3.5l2.25 2.25"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5.5 5.5 4 4M18.5 5.5 20 4M12 3V1.5"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
    </Svg>
  );
}
