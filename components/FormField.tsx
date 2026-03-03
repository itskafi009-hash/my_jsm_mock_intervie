import React from "react";
import { Controller, FieldValues, Path, Control, ControllerRenderProps, ControllerFieldState, UseFormStateReturn } from "react-hook-form";

interface FormFieldProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    render: (props: {
        field: ControllerRenderProps<T, Path<T>>;
        fieldState: ControllerFieldState;
        formState: UseFormStateReturn<T>;
    }) => React.ReactElement;
}

const FormField = <T extends FieldValues>({
                                              control,
                                              name,
                                              render,
                                          }: FormFieldProps<T>) => {
    return <Controller name={name} control={control} render={render} />;
};

export default FormField;