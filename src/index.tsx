import JSONEditor from 'jsoneditor/dist/jsoneditor-minimalist';
import React, { useEffect, useRef, useState } from 'react';
// import 'jsoneditor-react/es/editor.min.css';
import 'jsoneditor/dist/jsoneditor.css';

export type JsonEditorProps = {
    value?: object | null;
    onChange?: (json: object | null) => void;
    disabled?: boolean;
    [key: string]: any;
};

export function JsonEditor(props: JsonEditorProps) {
    const { onChange: propsOnChange, value: propsValue, disabled, ...restProps } = props;
    const jsonEditorRef = useRef(null);
    const elmRef = useRef(null);
    const [value, setValue] = useState(propsValue);
    // 用于在受控组件中，当相同数据变动时不进行改变，这样可避免表单输入的焦点变化
    const curValue = useRef(value);
    // 用于在禁用时缓存模式
    const cacheMode = useRef('');

    const onChange = () => {
        const text = jsonEditorRef.current.getText();
        const value = text === '' ? null : jsonEditorRef.current.get();
        curValue.current = value;
        propsOnChange?.(value);
    };
    useEffect(() => {
        let jsonEditor = jsonEditorRef.current;

        jsonEditor = new JSONEditor(elmRef.current, {
            onChange,
            ...restProps,
        });

        jsonEditor.set(value);
        jsonEditorRef.current = jsonEditor;
        return () => {
            if (jsonEditorRef.current) {
                jsonEditor.destroy();
                jsonEditorRef.current = null;
            }
        };
    }, []);
    useEffect(() => {
        const jsonEditor = jsonEditorRef.current;
        if (disabled && jsonEditor) {
            cacheMode.current = jsonEditor.getMode();
            jsonEditor.setMode('view');
        }
        return () => {
            if (!cacheMode.current || !jsonEditorRef.current) return;
            jsonEditor.setMode(cacheMode.current);
            cacheMode.current = '';
        };
    }, [disabled]);
    useEffect(() => {
        // 由change发生的value改变不进行设置
        if (propsValue !== curValue.current) {
            setValue(propsValue);
        }
    }, [propsValue]);
    useEffect(() => {
        jsonEditorRef.current.set(value);
    }, [value]);
    return <div ref={elmRef}></div>;
}
