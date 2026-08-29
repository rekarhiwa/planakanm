import Svg, { Path, Rect } from 'react-native-svg';

type TabIconName = 'Home' | 'Notes' | 'Calendar' | 'Stats' | 'Settings';

interface TabBarIconProps {
  name: TabIconName;
  color: string;
  size?: number;
}

const STROKE = 1.75;

export function TabBarIcon({ name, color, size = 22 }: TabBarIconProps) {
  switch (name) {
    case 'Home':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M4 10.2 12 4l8 6.2V19a1.5 1.5 0 0 1-1.5 1.5H15v-5.5H9V20.5H5.5A1.5 1.5 0 0 1 4 19v-8.8Z"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'Notes':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinejoin="round"
          />
          <Path d="M14 2v6h6" stroke={color} strokeWidth={STROKE} strokeLinejoin="round" />
          <Path
            d="M8 13h8M8 17h6M8 9h2"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
        </Svg>
      );
    case 'Calendar':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x={4} y={5.5} width={16} height={14.5} rx={2} stroke={color} strokeWidth={STROKE} />
          <Path d="M4 9.5h16M8 3.5v3M16 3.5v3" stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
        </Svg>
      );
    case 'Stats':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M6 19.5V11M12 19.5V5M18 19.5v-8"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
        </Svg>
      );
    case 'Settings':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
            stroke={color}
            strokeWidth={STROKE}
          />
          <Path
            d="M19.1 14.3a1.6 1.6 0 0 0 .32 1.76l.05.05a2 2 0 1 1-2.83 2.83l-.05-.05a1.6 1.6 0 0 0-1.76-.32 1.6 1.6 0 0 0-.97 1.46V21a2 2 0 1 1-4 0v-.09a1.6 1.6 0 0 0-.97-1.46 1.6 1.6 0 0 0-1.76.32l-.05.05a2 2 0 1 1-2.83-2.83l.05-.05a1.6 1.6 0 0 0 .32-1.76 1.6 1.6 0 0 0-1.46-.97H3a2 2 0 1 1 0-4h.09a1.6 1.6 0 0 0 1.46-.97 1.6 1.6 0 0 0-.32-1.76l-.05-.05a2 2 0 1 1 2.83-2.83l.05.05a1.6 1.6 0 0 0 1.76.32H9a1.6 1.6 0 0 0 .97-1.46V3a2 2 0 1 1 4 0v.09a1.6 1.6 0 0 0 .97 1.46 1.6 1.6 0 0 0 1.76-.32l.05-.05a2 2 0 1 1 2.83 2.83l-.05.05a1.6 1.6 0 0 0-.32 1.76V9c.62.26 1.05.87 1.05 1.58s-.43 1.32-1.05 1.58v.09a1.6 1.6 0 0 0 1.46.97H21a2 2 0 1 1 0 4h-.09a1.6 1.6 0 0 0-1.46.97Z"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinejoin="round"
          />
        </Svg>
      );
    default:
      return null;
  }
}
