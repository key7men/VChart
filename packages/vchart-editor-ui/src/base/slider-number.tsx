import { useState } from 'react';
import { InputNumber, Slider } from '@douyinfe/semi-ui';
import { isArray } from '@visactor/vutils';
import type { IBaseSliderNumberComponentProps } from '../typings/base';
import { defaultBaseComponentConfig } from '../config/base';

export function SliderNumber(props: IBaseSliderNumberComponentProps) {
  const label = props.label ?? defaultBaseComponentConfig.sliderNumber.label;
  const defaultValue = props.value ?? defaultBaseComponentConfig.sliderNumber.default;
  const min = props.config?.min ?? defaultBaseComponentConfig.sliderNumber.min;
  const max = props.config?.max ?? defaultBaseComponentConfig.sliderNumber.max;
  const unit = props.config?.unit ?? defaultBaseComponentConfig.sliderNumber.unit;
  const [value, setValue] = useState<number>(defaultValue);

  return (
    <div className="vchart-editor-ui-panel-base-container">
      <p className="vchart-editor-ui-panel-base-label">{label}</p>
      <Slider
        value={value}
        min={min}
        max={max}
        onChange={value => {
          const finalValue = isArray(value) ? value[0] : value;
          setValue(finalValue);
          props.onChange?.(finalValue);
        }}
        style={{ width: 200 }}
      ></Slider>
      <InputNumber
        value={value}
        min={min}
        max={max}
        onChange={value => {
          const finalValue = isArray(value) ? value[0] : value;
          setValue(finalValue);
          props.onChange?.(finalValue);
        }}
        formatter={value => `${value}${unit ?? ''}`}
        parser={value => {
          if (unit) {
            const match = value.match(`${unit}$`);
            if (match) {
              return value.slice(0, match.index);
            }
          }
          return value;
        }}
      />
    </div>
  );
}
