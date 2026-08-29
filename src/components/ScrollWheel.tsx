import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  StyleSheet,
  View,
  type ListRenderItem,
} from 'react-native';
import { FlatList, NativeViewGestureHandler } from 'react-native-gesture-handler';

import { spacing } from '../theme/colors';

const VISIBLE_ROWS = 5;

interface ScrollWheelProps<T> {
  items: T[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  renderItem: (
    item: T,
    meta: { isSelected: boolean; distance: number },
  ) => React.ReactNode;
  itemHeight?: number;
  width?: number | `${number}%`;
  keyExtractor?: (item: T, index: number) => string;
  fadeColor?: string;
}

export function ScrollWheel<T>({
  items,
  selectedIndex,
  onSelectIndex,
  renderItem,
  itemHeight = 52,
  width = '100%',
  keyExtractor,
  fadeColor = '#141414',
}: ScrollWheelProps<T>) {
  const listRef = useRef<FlatList<T>>(null);
  const isDraggingRef = useRef(false);
  const selectedRef = useRef(selectedIndex);
  const [focusedIndex, setFocusedIndex] = useState(selectedIndex);

  const sidePadding = itemHeight * Math.floor(VISIBLE_ROWS / 2);
  const wheelHeight = itemHeight * VISIBLE_ROWS;

  selectedRef.current = selectedIndex;

  const scrollToIndex = useCallback(
    (index: number, animated: boolean) => {
      const clamped = Math.max(0, Math.min(items.length - 1, index));
      listRef.current?.scrollToOffset({
        offset: clamped * itemHeight,
        animated,
      });
      setFocusedIndex(clamped);
    },
    [itemHeight, items.length],
  );

  useEffect(() => {
    if (isDraggingRef.current) return;
    scrollToIndex(selectedIndex, false);
  }, [selectedIndex, scrollToIndex]);

  const settleAtOffset = useCallback(
    (offsetY: number) => {
      const index = Math.round(offsetY / itemHeight);
      const clamped = Math.max(0, Math.min(items.length - 1, index));
      isDraggingRef.current = false;
      scrollToIndex(clamped, true);
      if (clamped !== selectedRef.current) {
        onSelectIndex(clamped);
      }
    },
    [itemHeight, items.length, onSelectIndex, scrollToIndex],
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(event.nativeEvent.contentOffset.y / itemHeight);
      const clamped = Math.max(0, Math.min(items.length - 1, index));
      setFocusedIndex((prev) => (prev === clamped ? prev : clamped));
    },
    [itemHeight, items.length],
  );

  const handleScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      settleAtOffset(event.nativeEvent.contentOffset.y);
    },
    [settleAtOffset],
  );

  const renderRow: ListRenderItem<T> = ({ item, index }) => {
    const distance = Math.abs(index - focusedIndex);
    const isSelected = distance === 0;
    return (
      <View style={[styles.row, { height: itemHeight }]}>
        {renderItem(item, { isSelected, distance })}
      </View>
    );
  };

  return (
    <NativeViewGestureHandler disallowInterruption>
      <View style={[styles.wheel, { height: wheelHeight, width }]}>
        <View
          pointerEvents="none"
          style={[
            styles.selectionBand,
            { top: sidePadding, height: itemHeight, borderColor: `${fadeColor === '#141414' ? '#ffffff' : '#000000'}22` },
          ]}
        />

        <FlatList
          ref={listRef}
          data={items}
          keyExtractor={keyExtractor ?? ((_, index) => String(index))}
          renderItem={renderRow}
          showsVerticalScrollIndicator={false}
          snapToInterval={itemHeight}
          snapToAlignment="start"
          decelerationRate="normal"
          disableIntervalMomentum
          nestedScrollEnabled
          bounces={false}
          overScrollMode="never"
          scrollEventThrottle={16}
          onScroll={handleScroll}
          initialNumToRender={VISIBLE_ROWS + 4}
          maxToRenderPerBatch={12}
          windowSize={5}
          removeClippedSubviews
          contentContainerStyle={{ paddingVertical: sidePadding }}
          getItemLayout={(_, index) => ({
            length: itemHeight,
            offset: itemHeight * index,
            index,
          })}
          onScrollBeginDrag={() => {
            isDraggingRef.current = true;
          }}
          onMomentumScrollEnd={handleScrollEnd}
          onScrollEndDrag={(event) => {
            const velocity = event.nativeEvent.velocity?.y ?? 0;
            if (Math.abs(velocity) < 0.1) {
              settleAtOffset(event.nativeEvent.contentOffset.y);
            }
          }}
        />

        <View pointerEvents="none" style={[styles.fade, styles.fadeTop, { height: sidePadding }]}>
          <View style={[styles.fadeLayer, { backgroundColor: fadeColor, opacity: 0.92 }]} />
          <View style={[styles.fadeLayer, { backgroundColor: fadeColor, opacity: 0.55 }]} />
        </View>
        <View pointerEvents="none" style={[styles.fade, styles.fadeBottom, { height: sidePadding }]}>
          <View style={[styles.fadeLayer, { backgroundColor: fadeColor, opacity: 0.55 }]} />
          <View style={[styles.fadeLayer, { backgroundColor: fadeColor, opacity: 0.92 }]} />
        </View>
      </View>
    </NativeViewGestureHandler>
  );
}

const styles = StyleSheet.create({
  wheel: {
    overflow: 'hidden',
  },
  row: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionBand: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    zIndex: 2,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 3,
  },
  fadeTop: {
    top: 0,
  },
  fadeBottom: {
    bottom: 0,
  },
  fadeLayer: {
    flex: 1,
  },
});
