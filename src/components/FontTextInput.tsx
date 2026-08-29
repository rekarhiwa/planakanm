import { forwardRef } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { TextInputProps, TextStyle } from 'react-native';

import { FONT_FAMILY } from '../theme/fonts';
import { rtlText } from '../theme/rtl';

interface FontTextInputProps extends TextInputProps {
  placeholder: string;
  placeholderColor: string;
  inputStyle?: TextStyle;
}

export const FontTextInput = forwardRef<TextInput, FontTextInputProps>(function FontTextInput(
  {
    placeholder,
    placeholderColor,
    style,
    inputStyle,
    value,
    multiline,
    ...props
  },
  ref,
) {
  const mergedStyle = StyleSheet.flatten([style, inputStyle, { fontFamily: FONT_FAMILY }, rtlText]);
  const hasValue = Boolean(value && String(value).length > 0);

  return (
    <View style={styles.wrap}>
      {!hasValue ? (
        <Text
          style={[
            mergedStyle,
            styles.placeholder,
            { color: placeholderColor },
            multiline ? styles.placeholderMultiline : null,
          ]}
          pointerEvents="none"
          numberOfLines={multiline ? undefined : 1}
        >
          {placeholder}
        </Text>
      ) : null}
      <TextInput
        {...props}
        ref={ref}
        value={value}
        multiline={multiline}
        placeholder=""
        style={[mergedStyle, styles.input]}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },
  input: {
    padding: 0,
    margin: 0,
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  placeholderMultiline: {
    paddingTop: 0,
  },
});
