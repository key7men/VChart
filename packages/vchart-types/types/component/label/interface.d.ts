import type { BaseLabelAttrs } from '@visactor/vrender-components';
import type { ConvertToMarkStyleSpec, Datum, ITextMarkSpec } from '../../typings';
import type { IComponentSpec } from '../base/interface';
import type { IRichTextCharacter } from '@visactor/vrender-core';
import type { ILabelMark } from '../../mark/label';
import type { ISeries } from '../../series';
export interface ILabelFormatMethodContext {
    series?: ISeries;
}
export interface ILabelSpec extends IComponentSpec {
    visible?: boolean;
    interactive?: boolean;
    textType?: string;
    formatMethod?: (text: string | string[], datum?: Datum, ctx?: ILabelFormatMethodContext) => string | string[] | IRichTextCharacter[];
    formatter?: string;
    offset?: number;
    position?: string;
    style?: ConvertToMarkStyleSpec<ITextMarkSpec>;
    state?: LabelStateStyle<Partial<ITextMarkSpec>>;
    overlap?: BaseLabelAttrs['overlap'];
    smartInvert?: BaseLabelAttrs['smartInvert'];
    animation?: BaseLabelAttrs['animation'];
    dataFilter?: BaseLabelAttrs['dataFilter'];
    customLayoutFunc?: BaseLabelAttrs['customLayoutFunc'];
    customOverlapFunc?: BaseLabelAttrs['customOverlapFunc'];
    labelLayout?: 'series' | 'region';
    centerOffset?: number;
    support3d?: boolean;
}
type LabelStateStyle<T> = {
    hover?: T;
    hover_reverse?: T;
    selected?: T;
    selected_reverse?: T;
};
export type ITotalLabelSpec = Pick<ILabelSpec, 'visible' | 'formatMethod' | 'interactive' | 'offset' | 'style' | 'state'>;
export interface ITotalLabelTheme extends Pick<ILabelSpec, 'visible' | 'interactive' | 'offset' | 'overlap' | 'smartInvert' | 'animation'> {
    style?: ITextMarkSpec;
}
export type TransformedLabelSpec = ILabelSpec & {
    getStyleHandler: (series: ISeries) => (mark?: ILabelMark) => void;
};
export {};
