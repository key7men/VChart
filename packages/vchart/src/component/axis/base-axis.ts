import { ticks } from '@visactor/vutils-extension';
// eslint-disable-next-line no-duplicate-imports
import type { ITickDataOpt } from '@visactor/vutils-extension';
import type { IBaseScale } from '@visactor/vscale';
import type { IGroup, IGraphic } from '@visactor/vrender-core';
// eslint-disable-next-line no-duplicate-imports
import type { AxisItem } from '@visactor/vrender-components';
import type {
  IOrientType,
  IPolarOrientType,
  Datum,
  StringOrNumber,
  IGroup as ISeriesGroup,
  CoordinateType
} from '../../typings';
import { BaseComponent } from '../base/base-component';
import type { IPolarAxisCommonTheme } from './polar/interface';
import type { ICartesianAxisCommonTheme } from './cartesian/interface';
import type { CompilableData } from '../../compile/data';
import type { IAxis, ICommonAxisSpec, ITick } from './interface';
import type { IComponentOption } from '../interface';
import { array, get, isArray, isBoolean, isFunction, isNil, isValid, maxInArray } from '@visactor/vutils';
import { eachSeries, getSeries } from '../../util/model';
import { mergeSpec } from '../../util/spec/merge-spec';
import type { ISeries } from '../../series/interface';
import { ChartEvent, LayoutZIndex } from '../../constant';
import { animationConfig } from '../../animation/utils';
// eslint-disable-next-line no-duplicate-imports
import { degreeToRadian, pickWithout, type LooseFunction, isEqual } from '@visactor/vutils';
import { DEFAULT_TITLE_STYLE, transformAxisLineStyle } from './util';
import { transformAxisLabelStateStyle, transformStateStyle, transformToGraphic } from '../../util/style';
import { DataView, type ITransformOptions } from '@visactor/vdataset';
import {
  GridEnum,
  registerAxis as registerVGrammarAxis,
  registerGrid as registerVGrammarGrid
} from '@visactor/vgrammar-core';
import { ComponentMark, registerComponentMark, type IComponentMark } from '../../mark/component';
import { Factory } from '../../core/factory';
// eslint-disable-next-line no-duplicate-imports
import { GroupFadeIn, GroupTransition } from '@visactor/vrender-components';
// eslint-disable-next-line no-duplicate-imports
import { GroupFadeOut } from '@visactor/vrender-core';
import { scaleParser } from '../../data/parser/scale';
import { registerDataSetInstanceParser, registerDataSetInstanceTransform } from '../../data/register';

export abstract class AxisComponent<T extends ICommonAxisSpec & Record<string, any> = any> // FIXME: 补充公共类型，去掉 Record<string, any>
  extends BaseComponent<T>
  implements IAxis
{
  static specKey = 'axes';
  specKey = 'axes';

  protected _orient: IPolarOrientType | IOrientType;
  getOrient() {
    return this._orient;
  }

  protected _scale!: IBaseScale;
  getScale() {
    return this._scale;
  }

  protected _scales: IBaseScale[] = [];
  getScales() {
    return this._scales;
  }

  protected _tickData!: CompilableData;
  getTickData() {
    return this._tickData;
  }

  // 与系列的关联关系
  // 优先级：id > index
  // 最终结果：series & region取交集
  protected _seriesUserId?: StringOrNumber[];
  protected _seriesIndex?: number[];
  protected _regionUserId?: StringOrNumber[];
  protected _regionIndex?: number[];

  /**
   * if axis will be shown
   */
  protected _visible: boolean = true;
  get visible() {
    return this._visible;
  }

  /** 轴是否产生反转的真实值，在横向图表的竖轴上可能和用户在 spec 上配的值相反 */
  protected _inverse: boolean;
  getInverse() {
    return this._inverse;
  }

  protected _tick: ITick | undefined = undefined;
  protected abstract computeDomain(data: { min: number; max: number; values: any[] }[]): StringOrNumber[];
  abstract valueToPosition(value: any): number;
  protected abstract axisHelper(): any;
  protected abstract getSeriesStatisticsField(s: ISeries): string[];
  protected abstract updateSeriesScale(): void;
  protected abstract collectData(depth: number, rawData?: boolean): { min: number; max: number; values: any[] }[];
  protected abstract _initData(): void;
  abstract transformScaleDomain(): void;

  protected _dataFieldText: string;
  protected _axisMark: IComponentMark;
  protected _gridMark: IComponentMark;

  constructor(spec: T, options: IComponentOption) {
    super(spec, options);
    this._visible = spec.visible ?? true;
  }

  protected _getNeedClearVRenderComponents(): IGraphic[] {
    return [];
  }

  getVRenderComponents() {
    return array(this._axisMark?.getProduct()?.getGroupGraphicItem());
  }

  created() {
    super.created();
    //series and regions
    this.setSeriesAndRegionsFromSpec();
    // event
    this.initEvent();
    // scales
    this.initScales();
    this.updateSeriesScale();
    // data，当且仅当轴展示的时候处理
    this.getVisible() && this._initData();

    if (this._visible) {
      // 创建语法元素
      const axisMark = this._createMark(
        { type: 'component', name: `axis-${this.getOrient()}` },
        {
          componentType: this.getOrient() === 'angle' ? 'circleAxis' : 'axis',
          mode: this._spec.mode,
          noSeparateStyle: true,
          skipTheme: true // skip theme of vgrammar to avoid merge
        }
      );
      this._axisMark = axisMark;
      axisMark.setZIndex(this.layoutZIndex);
      if (isValid(this._spec.id)) {
        axisMark.setUserId(this._spec.id);
      }
      this._marks.addMark(axisMark);

      if (this._spec.grid?.visible) {
        const gridMark = this._createMark(
          { type: 'component', name: `axis-${this.getOrient()}-grid` },
          {
            componentType: this.getOrient() === 'angle' ? GridEnum.circleAxisGrid : GridEnum.lineAxisGrid,
            mode: this._spec.mode,
            noSeparateStyle: true,
            skipTheme: true
          }
        );
        gridMark.setZIndex(this._spec.grid?.style?.zIndex ?? this._spec.grid?.zIndex ?? LayoutZIndex.Axis_Grid);
        this._marks.addMark(gridMark);
        this._gridMark = gridMark;
      }

      // interactive
      if (isBoolean(this._spec.interactive)) {
        this._marks.forEach(m => m.setInteractive(this._spec.interactive));
      }

      // Tip: 支持 spec.animationAppear.axis，并且坐标轴默认关闭动画
      if (
        this._option.animation !== false &&
        get(this._option.getChart().getSpec(), 'animation') !== false &&
        this._spec.animation === true
      ) {
        const axisAnimateConfig = animationConfig(Factory.getAnimationInKey('axis')?.(), {
          appear:
            this._spec.animationAppear ??
            get(this._option.getChart().getSpec(), 'animationAppear.axis') ??
            get(this._option.getChart().getSpec(), 'animationAppear'),
          disappear:
            this._spec.animationDisappear ??
            get(this._option.getChart().getSpec(), 'animationDisappear.axis') ??
            get(this._option.getChart().getSpec(), 'animationDisappear'),
          enter:
            this._spec.animationEnter ??
            get(this._option.getChart().getSpec(), 'animationEnter.axis') ??
            get(this._option.getChart().getSpec(), 'animationEnter'),
          exit:
            this._spec.animationExit ??
            get(this._option.getChart().getSpec(), 'animationExit.axis') ??
            get(this._option.getChart().getSpec(), 'animationExit'),
          update:
            this._spec.animationUpdate ??
            get(this._option.getChart().getSpec(), 'animationUpdate.axis') ??
            get(this._option.getChart().getSpec(), 'animationUpdate')
        });
        // 因为坐标轴的更新动画中处理了 enter，所以需要将 enter 的参数传入
        if (axisAnimateConfig.enter) {
          axisAnimateConfig.update[0].customParameters = {
            enter: axisAnimateConfig.enter[0]
          };
        }
        this._marks.forEach(m => m.setAnimationConfig(axisAnimateConfig));
      }
    }
  }

  protected isSeriesDataEnable() {
    let enable = true;
    eachSeries(
      this._regions,
      s => {
        if (isArray(s.getViewDataStatistics()?.latestData)) {
          enable = false;
        }
      },
      {
        userId: this._seriesUserId,
        specIndex: this._seriesIndex
      }
    );
    return enable;
  }

  protected setSeriesAndRegionsFromSpec() {
    const { seriesId, seriesIndex, regionId, regionIndex } = this._spec;
    isValid(seriesId) && (this._seriesUserId = array(seriesId));
    isValid(regionId) && (this._regionUserId = array(regionId));
    isValid(seriesIndex) && (this._seriesIndex = array(seriesIndex));
    isValid(regionIndex) && (this._regionIndex = array(regionIndex));
    this._regions = this._option.getRegionsInUserIdOrIndex(this._regionUserId as string[], this._regionIndex);
    // _regions 被更新了，layoutBindRegionID 也要更新
    this.layout.layoutBindRegionID = this._regions.map(x => x.id);
  }

  getBindSeriesFilter() {
    return {
      userId: this._seriesUserId,
      specIndex: this._seriesIndex
    };
  }

  protected initEvent() {
    this.event.on(
      ChartEvent.scaleUpdate,
      { filter: ({ model }) => model?.id === this.id },
      this.effect.scaleUpdate.bind(this)
    );
    const viewStatistics = getSeries(this._regions, {
      userId: this._seriesUserId,
      specIndex: this._seriesIndex
    })
      .map(s => s.getViewDataStatistics())
      .filter(v => !!v);

    if (viewStatistics.length > 1) {
      this._option.dataSet.multipleDataViewAddListener(viewStatistics, 'change', () => {
        this.updateScaleDomain();
      });
    } else if (viewStatistics.length === 1) {
      viewStatistics[0].target.addListener('change', () => {
        this.updateScaleDomain();
      });
    }

    eachSeries(
      this._regions,
      s => {
        s.event.on(ChartEvent.rawDataUpdate, { filter: ({ model }) => model?.id === s.id }, () => {
          // 只清除，不更新，在需要时，更新一次。避免多系列下多次更新
          this._clearRawDomain();
        });
      },
      {
        userId: this._seriesUserId,
        specIndex: this._seriesIndex
      }
    );
  }

  protected updateScaleDomain() {
    // 留给各个类型的 axis 来 override
  }

  protected _clearRawDomain() {
    // 留给各个类型的 axis 来 override
  }

  protected computeData(updateType?: 'domain' | 'range' | 'force'): void {
    if (this._tickData && (updateType === 'force' || !isEqual(this._scale.range(), [0, 1]))) {
      this._tickData.getDataView().reRunAllTransform();
      this._tickData.updateData();
    }
  }

  protected initScales() {
    this._scales = [this._scale];
    const groups: ISeriesGroup[] = [];
    eachSeries(
      this._regions,
      s => {
        const g = s.getGroups();
        g && groups.push(g);
      },
      {
        userId: this._seriesUserId,
        specIndex: this._seriesIndex
      }
    );
    if (groups.length !== 0) {
      const depth = maxInArray(groups.map(g => g.fields.length));
      for (let i = 1; i < depth; i++) {
        const scale = this._scale.clone();
        this._scales.push(scale);
      }
    }
    // this.updateScaleDomain();
  }

  /** Update API **/
  _compareSpec(spec: T, prevSpec: T) {
    const result = super._compareSpec(spec, prevSpec);
    result.reRender = true;
    if (prevSpec?.type !== spec?.type) {
      result.reMake = true;
      return result;
    }
    return result;
  }

  protected getLabelFormatMethod() {
    return this._spec.label.formatMethod
      ? (value: any, datum: any, index: number) => this._spec.label.formatMethod(datum.rawValue, datum)
      : null;
  }

  protected getLabelItems(length: number) {
    return isArray(this._tickData.getLatestData())
      ? [
          this._tickData
            .getLatestData()
            .map((obj: Datum) => {
              return {
                id: obj.value,
                label: obj.value,
                value: length === 0 ? 0 : this.dataToPosition([obj.value]) / length,
                rawValue: obj.value
              };
            })
            .filter((entry: AxisItem) => entry.value >= 0 && entry.value <= 1)
        ]
      : [];
  }

  protected _delegateAxisContainerEvent(component: IGroup) {
    component.addEventListener('*', ((event: any, type: string) =>
      this._delegateEvent(component as unknown as IGraphic, event, type)) as LooseFunction);
  }

  protected _getAxisAttributes() {
    const spec = this._spec;
    let titleAngle = spec.title.angle;
    let titleTextStyle;
    if (spec.orient === 'left' || spec.orient === 'right') {
      // 处理纵轴的标题样式
      if (spec.title?.autoRotate && isNil(spec.title.angle)) {
        titleAngle = spec.orient === 'left' ? -90 : 90;
        titleTextStyle = DEFAULT_TITLE_STYLE[spec.orient];
      }
    }

    const labelSpec = pickWithout(spec.label, ['style', 'formatMethod', 'state']);
    const backgroundSpec = spec.background ?? {};
    const titleBackgroundSpec = spec.title.background ?? {};
    return {
      orient: this.getOrient(),
      select: this._option.disableTriggerEvent === true ? false : spec.select,
      hover: this._option.disableTriggerEvent === true ? false : spec.hover,
      line: transformAxisLineStyle(spec.domainLine),
      label: {
        style: isFunction(spec.label.style)
          ? (datum: Datum, index: number, data: Datum[], layer?: number) => {
              const style = spec.label.style(datum.rawValue, index, datum, data, layer);
              return transformToGraphic(mergeSpec({}, this._theme.label?.style, style));
            }
          : transformToGraphic(spec.label.style),
        formatMethod: spec.label.formatMethod
          ? (value: any, datum: any, index: number) => {
              return spec.label.formatMethod(datum.rawValue, datum);
            }
          : null,
        state: transformAxisLabelStateStyle(spec.label.state),
        ...labelSpec
      },
      tick:
        spec.tick.visible === false
          ? { visible: false }
          : {
              visible: spec.tick.visible,
              length: spec.tick.tickSize,
              inside: spec.tick.inside,
              alignWithLabel: spec.tick.alignWithLabel,
              style: isFunction(spec.tick.style)
                ? (value: number, index: number, datum: Datum, data: Datum[]) => {
                    const style = (spec.tick.style as any)(value, index, datum, data);
                    return transformToGraphic(mergeSpec({}, this._theme.tick?.style, style));
                  }
                : transformToGraphic(spec.tick.style),
              state: transformStateStyle(spec.tick.state),
              dataFilter: spec.tick.dataFilter
            },
      subTick:
        spec.subTick.visible === false
          ? { visible: false }
          : {
              visible: spec.subTick.visible,
              length: spec.subTick.tickSize,
              inside: spec.subTick.inside,
              count: spec.subTick.tickCount,
              style: isFunction(spec.subTick.style)
                ? (value: number, index: number, datum: Datum, data: Datum[]) => {
                    const style = (spec.subTick.style as any)(value, index, datum, data);
                    return transformToGraphic(mergeSpec({}, this._theme.subTick?.style, style));
                  }
                : transformToGraphic(spec.subTick.style),
              state: transformStateStyle(spec.subTick.state)
            },
      title:
        spec.title.visible === false
          ? { visible: false }
          : {
              visible: spec.title.visible,
              position: spec.title.position,
              space: spec.title.space,
              autoRotate: false, // 默认不对外提供该配置
              angle: titleAngle ? degreeToRadian(titleAngle) : null,
              textStyle: mergeSpec({}, titleTextStyle, transformToGraphic(spec.title.style)),
              padding: spec.title.padding,
              shape:
                spec.title.shape?.visible === false
                  ? { visible: false }
                  : {
                      visible: spec.title.shape?.visible,
                      space: spec.title.shape?.space,
                      style: transformToGraphic(spec.title.shape?.style)
                    },
              background:
                titleBackgroundSpec.visible === false
                  ? { visible: false }
                  : {
                      visible: titleBackgroundSpec.visible,
                      style: transformToGraphic(titleBackgroundSpec.style)
                    },
              state: {
                text: transformStateStyle(spec.title.state),
                shape: transformStateStyle(spec.title.shape?.state),
                background: transformStateStyle(spec.title.background?.state)
              },
              pickable: spec.title.style?.pickable !== false,
              childrenPickable: spec.title.style?.pickable !== false,
              ...spec.title
            },
      panel:
        backgroundSpec.visible === false
          ? { visible: false }
          : {
              visible: backgroundSpec.visible,
              style: transformToGraphic(backgroundSpec.style),
              state: transformStateStyle(backgroundSpec.state)
            }
    };
  }

  protected _getGridAttributes() {
    const spec = this._spec;
    return {
      alternateColor: spec.grid.alternateColor,
      alignWithLabel: spec.grid.alignWithLabel,
      style: isFunction(spec.grid.style)
        ? () => {
            return (datum: Datum, index: number) => {
              const style = spec.grid.style(datum.datum?.rawValue, index, datum.datum);
              return transformToGraphic(mergeSpec({}, this._theme.grid?.style, style));
            };
          }
        : transformToGraphic(spec.grid.style),
      subGrid:
        spec.subGrid.visible === false
          ? { visible: false }
          : {
              type: 'line',
              visible: spec.subGrid.visible,
              alternateColor: spec.subGrid.alternateColor,
              style: transformToGraphic(spec.subGrid.style)
            }
    };
  }

  protected _initTickDataSet<T extends ITickDataOpt>(options: T) {
    registerDataSetInstanceParser(this._option.dataSet, 'scale', scaleParser);
    registerDataSetInstanceTransform(this._option.dataSet, 'ticks', ticks);
    const tickData = new DataView(this._option.dataSet, { name: `${this.type}_${this.id}_ticks` })
      .parse(this._scale, {
        type: 'scale'
      })
      .transform(
        {
          type: 'ticks',
          options
        },
        false
      );
    return tickData;
  }

  protected _tickTransformOption(coordinateType: CoordinateType): ITickDataOpt {
    const tick = this._tick || {};
    const label = this._spec.label || {};
    const { tickCount, forceTickCount, tickStep, tickMode } = tick;
    const { style: labelStyle, formatMethod: labelFormatter, minGap: labelGap } = label;
    return {
      sampling: this._spec.sampling !== false,
      tickCount,
      forceTickCount,
      tickStep,
      tickMode,

      axisOrientType: this._orient,
      coordinateType: coordinateType,

      labelStyle,
      labelFormatter,
      labelGap
    };
  }

  addTransformToTickData(options: ITransformOptions, execute?: boolean) {
    this._tickData?.getDataView()?.transform(options, execute);
  }

  dataToPosition(values: any[]): number {
    return this._scale.scale(values);
  }
}

export const registerAxis = () => {
  registerVGrammarAxis();
  registerVGrammarGrid();
  registerComponentMark();
  Factory.registerAnimation('axis', () => ({
    appear: {
      custom: GroupFadeIn
    },
    update: {
      custom: GroupTransition
    },
    exit: {
      custom: GroupFadeOut
    }
  }));
};
