// components/common/FormField.tsx
import React, { forwardRef } from 'react';
import {
  Controller,
  Control,
  FieldValues,
  FieldPath,
  RegisterOptions,
} from 'react-hook-form';
import {
  KeyboardTypeOptions,
  TextInput,
  TextStyle,
  ViewStyle,
} from 'react-native';
import Input from '@/components/common/input';

type FormFieldProps<TFieldValues extends FieldValues> = {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  rules?: Omit<
    RegisterOptions<TFieldValues, FieldPath<TFieldValues>>,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
  >;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  error?: string | undefined;
};

function FormField<TFieldValues extends FieldValues>(
  props: FormFieldProps<TFieldValues>,
  ref: React.Ref<TextInput>
) {
  const {
    name,
    control,
    rules,
    placeholder,
    secureTextEntry = false,
    keyboardType = 'default',
    leftIcon,
    rightIcon,
    containerStyle,
    inputStyle,
  } = props;

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <Input
          ref={ref}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          leftIcon={leftIcon}
          rightIcon={rightIcon}
          containerStyle={containerStyle}
          inputStyle={inputStyle}
          error={error?.message}
        />
      )}
    />
  );
}

export default forwardRef(FormField) as <TFieldValues extends FieldValues>(
  props: FormFieldProps<TFieldValues> & { ref?: React.Ref<TextInput> }
) => React.ReactElement;
