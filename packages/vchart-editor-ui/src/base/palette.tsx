import { Select as SemiSelect } from '@douyinfe/semi-ui';
import { isShallowEqual } from '@visactor/vutils';
import type { IBasePaletteComponentProps } from '../typings/base';
import { tooltipWrapper } from '../utils/node';

export const defaultPalettes = [
  ['#1664FF', '#1AC6FF', '#FF8A00', '#3CC780', '#7442D4', '#FFC400', '#304D77', '#B48DEB', '#009488', '#FF7DDA'],
  ['#4BC7A2', '#2E75D2', '#34B6FD', '#F5C040', '#98DD62', '#7272E1', '#87DBDD', '#FF8406', '#009488', '#FF7DDA'],
  ['#2E62F1', '#4DC36A', '#FF8406', '#FFCC00', '#4F44CF', '#5AC8FA', '#003A8C', '#B08AE2', '#009488', '#FF7DDA']
];

export function Palette(props: IBasePaletteComponentProps) {
  const label = props.label ?? '配色';
  const palettes: string[][] = props.config?.palettes ?? defaultPalettes;

  // TODO: handle when value cannot match
  const currentPaletteIndex = palettes.reduce((currentIndex, palette, index) => {
    return isShallowEqual(props.palette, palette) ? index : currentIndex;
  }, -1);

  return (
    <div className="vchart-editor-ui-panel-base-container">
      {tooltipWrapper(<p className="vchart-editor-ui-panel-base-label">{label}</p>, props.tooltip)}{' '}
      <SemiSelect
        value={currentPaletteIndex}
        style={{ width: 180 }}
        onChange={value => {
          props.onChange?.(palettes[value as number]);
        }}
      >
        {palettes.map((palette, paletteIndex) => (
          <SemiSelect.Option key={paletteIndex} value={paletteIndex}>
            <div className="vchart-editor-ui-panel-palette-container">
              {palette.map((color, index) => (
                <span
                  key={`${index}_${color}`}
                  style={{ backgroundColor: color }}
                  className="vchart-editor-ui-panel-palette-item"
                />
              ))}
            </div>
          </SemiSelect.Option>
        ))}
      </SemiSelect>
    </div>
  );
}
