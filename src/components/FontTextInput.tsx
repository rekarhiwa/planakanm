import { forwardRef } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import type { TextInputProps, TextStyle } from 'react-native';

import { FONT_FAMILY } from '../theme/fonts';
import { getIsRTL } from '../theme/rtl';

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
    textAlign: textAlignProp,
    ...props
  },
  ref,
) {
  const rtl = getIsRTL();
  const textAlign = textAlignProp ?? (rtl ? 'right' : 'left');
  const writingDirection: 'rtl' | 'ltr' = rtl ? 'rtl' : 'ltr';
  const flatStyle = StyleSheet.flatten([style, inputStyle]) as TextStyle | undefined;
  const mergedStyle: TextStyle = {
    ...flatStyle,
    fontFamily: FONT_FAMILY,
    textAlign,
    writingDirection,
  };
  const hasValue = Boolean(value && String(value).length > 0);

  return (
    <View
      style={[
        styles.wrap,
        !multiline ? styles.wrapSingle : null,
        rtl ? styles.wrapRtl : styles.wrapLtr,
      ]}
    >
      {!hasValue ? (
        <Text
          style={[
            mergedStyle,
            styles.placeholder,
            { color: placeholderColor, textAlign, writingDirection },
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
        textAlign={textAlign}
        style={[
          mergedStyle,
          styles.input,
          !multiline ? styles.inputSingle : null,
          Platform.OS === 'android' ? styles.androidInput : null,
        ]}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    width: '100%',
    alignSelf: 'stretch',
  },
  wrapSingle: {
    minHeight: 52,
    justifyContent: 'center',
  },
  wrapRtl: {
    direction: 'rtl',
  },
  wrapLtr: {
    direction: 'ltr',
  },
  input: {
    padding: 0,
    margin: 0,
    width: '100%',
  },
  inputSingle: {
    minHeight: 52,
    textAlignVertical: 'center',
  },
  androidInput: {
    includeFontPadding: false,
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    textAlignVertical: 'center',
  },
  placeholderMultiline: {
    top: 0,
    bottom: undefined,
    textAlignVertical: 'top',
  },
});
