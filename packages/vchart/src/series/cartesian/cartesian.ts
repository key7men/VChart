import type { DataView } from '@visactor/vdataset';
import type { ICartesianSeries } from '../interface';
import { BaseSeries } from '../base/base-series';
import type { IPoint } from '../../typings/coordinate';
import type { IBaseScale } from '@visactor/vscale';
import {
  STACK_FIELD_END,
  STACK_FIELD_END_PERCENT,
  STACK_FIELD_END_OffsetSilhouette,
  STACK_FIELD_START,
  STACK_FIELD_START_PERCENT,
  STACK_FIELD_START_OffsetSilhouette
} from '../../constant';
import type { IAxisHelper } from '../../component/axis/cartesian/interface';
import type { DirectionType } from '../../typings/space';
// eslint-disable-next-line no-duplicate-imports
import { Direction } from '../../typings/space';
import type { Datum, StringOrNumber } from '../../typings';
import { couldBeValidNumber } from '../../util/type';
import { array, isValid } from '@visactor/vutils';
// eslint-disable-next-line no-duplicate-imports
import { isContinuous } from '@visactor/vscale';
import type { StatisticOperations } from '../../data/transforms/dimension-statistics';
import type { ICartesianSeriesSpec } from './interface';
import { sortDataInAxisHelper } from '../util/utils';
import type { IAxisLocationCfg } from '../../component/axis';

export abstract class CartesianSeries<T extends ICartesianSeriesSpec = ICartesianSeriesSpec>
  extends BaseSeries<T>
  implements ICartesianSeries
{
  readonly coordinate: 'cartesian' = 'cartesian';
  protected _bandPosition = 0.5;
  protected _scaleConfig: IAxisLocationCfg = {
    bandPosition: this._bandPosition
  };
  protected _buildScaleConfig() {
    this._scaleConfig = {
      bandPosition: this._bandPosition
    };
  }

  protected _fieldX!: string[];
  get fieldX() {
    return this._fieldX;
  }
  setFieldX(f: string | string[]) {
    this._fieldX = array(f);
  }

  protected _fieldY!: string[];
  get fieldY() {
    return this._fieldY;
  }
  setFieldY(f: string | string[]) {
    this._fieldY = array(f);
  }

  protected _fieldZ?: string[];
  get fieldZ(): string[] | undefined {
    return this._fieldZ;
  }
  setFieldZ(f?: string | string[]) {
    this._fieldZ = f && array(f);
  }

  protected _fieldX2!: string;
  get fieldX2() {
    return this._fieldX2;
  }
  setFieldX2(f: string) {
    this._fieldX2 = f;
  }

  protected _fieldY2!: string;
  get fieldY2() {
    return this._fieldY2;
  }
  setFieldY2(f: string) {
    this._fieldY2 = f;
  }

  protected _specXField: string[];
  protected _specYField: string[];

  protected _direction: DirectionType = Direction.vertical;
  get direction() {
    return this._direction;
  }

  protected _scaleX!: IBaseScale;
  get scaleX() {
    return this._scaleX;
  }
  setScaleX(s: IBaseScale) {
    this._scaleX = s;
  }

  protected _scaleY!: IBaseScale;
  get scaleY() {
    return this._scaleY;
  }
  setScaleY(s: IBaseScale) {
    this._scaleY = s;
  }

  protected _scaleZ?: IBaseScale;
  get scaleZ() {
    return this._scaleZ;
  }
  setScaleZ(s: IBaseScale) {
    this._scaleZ = s;
  }

  _xAxisHelper!: IAxisHelper;
  getXAxisHelper() {
    return this._xAxisHelper;
  }
  setXAxisHelper(h: IAxisHelper) {
    this._xAxisHelper = h;
    this.onXAxisHelperUpdate();
  }

  _yAxisHelper!: IAxisHelper;
  getYAxisHelper() {
    return this._yAxisHelper;
  }
  setYAxisHelper(h: IAxisHelper) {
    this._yAxisHelper = h;
    this.onYAxisHelperUpdate();
  }

  _zAxisHelper?: IAxisHelper;
  getZAxisHelper() {
    return this._zAxisHelper;
  }
  setZAxisHelper(h: IAxisHelper) {
    this._zAxisHelper = h;
    this.onYAxisHelperUpdate();
  }

  protected _sortDataByAxis: boolean = false;
  get sortDataByAxis() {
    return this._sortDataByAxis;
  }

  getStatisticFields() {
    const fields: { key: string; operations: StatisticOperations }[] = [];
    if (this.getXAxisHelper()?.getScale) {
      (this._fieldX2 ? [...this._fieldX, this._fieldX2] : this._fieldX).forEach(f => {
        const result: { key: string; operations: Array<'max' | 'min' | 'values'> } = { key: f, operations: [] };
        if (isContinuous(this.getXAxisHelper().getScale(0).type)) {
          result.operations = ['max', 'min'];
        } else {
          result.operations = ['values'];
        }
        fields.push(result);
      });
    }
    if (this.getYAxisHelper()?.getScale) {
      (this._fieldY2 ? [...this._fieldY, this._fieldY2] : this._fieldY).forEach(f => {
        const result: { key: string; operations: Array<'max' | 'min' | 'values'> } = { key: f, operations: [] };
        if (isContinuous(this.getYAxisHelper().getScale(0).type)) {
          result.operations = ['max', 'min'];
        } else {
          result.operations = ['values'];
        }
        fields.push(result);
      });
    }
    if (this._fieldZ && this.getZAxisHelper()?.getScale) {
      this._fieldZ.forEach(f => {
        const result: { key: string; operations: Array<'max' | 'min' | 'values'> } = { key: f, operations: [] };
        if (isContinuous(this.getZAxisHelper().getScale(0).type)) {
          result.operations = ['max', 'min'];
        } else {
          result.operations = ['values'];
        }
        fields.push(result);
      });
    }
    if (this.getStack()) {
      fields.push({
        key: this.getStackValueField(),
        operations: ['allValid']
      });
    }
    return fields;
  }

  getGroupFields() {
    return this.direction === 'vertical' ? this._fieldX : this._fieldY;
  }

  getStackGroupFields(): string[] {
    return this.getGroupFields();
  }

  getStackValueField() {
    // TODO: hack
    if (this.direction === Direction.vertical) {
      return array(this._spec.yField)[0];
    }
    return array(this._spec.xField)[0];
  }

  setValueFieldToStack(): void {
    if (this.direction === Direction.vertical) {
      this.setFieldY(STACK_FIELD_END);
      this.setFieldY2(STACK_FIELD_START);
    } else {
      this.setFieldX(STACK_FIELD_END);
      this.setFieldX2(STACK_FIELD_START);
    }
  }

  setValueFieldToPercent(): void {
    if (this.direction === Direction.vertical) {
      this.setFieldY(STACK_FIELD_END_PERCENT);
      this.setFieldY2(STACK_FIELD_START_PERCENT);
    } else {
      this.setFieldX(STACK_FIELD_END_PERCENT);
      this.setFieldX2(STACK_FIELD_START_PERCENT);
    }
  }

  setValueFieldToStackOffsetSilhouette(): void {
    if (this.direction === Direction.vertical) {
      this.setFieldY(STACK_FIELD_END_OffsetSilhouette);
      this.setFieldY2(STACK_FIELD_START_OffsetSilhouette);
    } else {
      this.setFieldX(STACK_FIELD_END_OffsetSilhouette);
      this.setFieldX2(STACK_FIELD_START_OffsetSilhouette);
    }
  }

  onXAxisHelperUpdate(): void {
    this.onMarkPositionUpdate();
  }

  onYAxisHelperUpdate(): void {
    this.onMarkPositionUpdate();
  }

  onZAxisHelperUpdate(): void {
    this.onMarkPositionUpdate();
  }

  setAttrFromSpec() {
    super.setAttrFromSpec();
    this.setFieldX(this._spec.xField);
    this.setFieldY(this._spec.yField);
    this.setFieldZ(this._spec.zField);
    this._specXField = array(this._spec.xField);
    this._specYField = array(this._spec.yField);
    if (isValid(this._spec.direction)) {
      this._direction = this._spec.direction;
    }

    this.setFieldX2(this._spec?.x2Field);
    this.setFieldY2(this._spec?.y2Field);

    if (this._stack) {
      this.setValueFieldToStack();
    }
    if (this._percent) {
      this.setValueFieldToPercent();
    }
    if (this._stackOffsetSilhouette) {
      this.setValueFieldToStackOffsetSilhouette();
    }

    if (isValid(this._spec.sortDataByAxis)) {
      this._sortDataByAxis = this._spec.sortDataByAxis === true;
    }
  }

  dataToPosition(datum: Datum): IPoint | null {
    if (!datum) {
      return null;
    }
    return {
      x: this.dataToPositionX(datum),
      y: this.dataToPositionY(datum)
    } as IPoint;
  }

  protected _buildMarkAttributeContext() {
    super._buildMarkAttributeContext();
    // position
    this._markAttributeContext.valueToX = this.valueToPositionX.bind(this);
    this._markAttributeContext.valueToY = this.valueToPositionY.bind(this);
    this._markAttributeContext.xBandwidth = (depth: number = 0) => this.getXAxisHelper().getBandwidth?.(depth) ?? 0;
    this._markAttributeContext.yBandwidth = (depth: number = 0) => this.getYAxisHelper().getBandwidth?.(depth) ?? 0;
    this._markAttributeContext.valueToPosition = this.valueToPosition.bind(this);
  }

  valueToPosition(xValue: StringOrNumber | StringOrNumber[], yValue: StringOrNumber | StringOrNumber[]) {
    return {
      x: this.valueToPositionX(xValue),
      y: this.valueToPositionY(yValue)
    };
  }

  protected _axisPosition(helper: IAxisHelper, value: StringOrNumber | StringOrNumber[], datum?: any) {
    this._scaleConfig.datum = datum;
    if (helper.isContinuous) {
      return helper.valueToPosition(value, this._scaleConfig);
    }
    return helper.dataToPosition(array(value), this._scaleConfig);
  }

  valueToPositionX(value: StringOrNumber | StringOrNumber[], datum?: any) {
    return this._axisPosition(this._xAxisHelper, value, datum);
  }
  valueToPositionY(value: StringOrNumber | StringOrNumber[], datum?: any) {
    return this._axisPosition(this._yAxisHelper, value, datum);
  }

  protected _positionXEncoder?: (datum: Datum) => number;

  dataToPositionX(datum: Datum): number {
    if (this._positionXEncoder) {
      return this._positionXEncoder(datum);
    }

    if (!this._xAxisHelper) {
      this._positionXEncoder = (datum: Datum) => Number.NaN;

      return Number.NaN;
    }
    const fields = this._xAxisHelper.getFields ? this._xAxisHelper.getFields() : this._fieldX;
    if (!fields || fields.length === 0) {
      this._positionXEncoder = (datum: Datum) => null;
      return null;
    }

    if (this._xAxisHelper.isContinuous) {
      this._positionXEncoder = (datum: Datum) => {
        this._scaleConfig.datum = datum;
        return this._xAxisHelper.valueToPosition(this.getDatumPositionValue(datum, fields[0]), this._scaleConfig);
      };
    } else {
      this._positionXEncoder = (datum: Datum) => {
        this._scaleConfig.datum = datum;
        return this._xAxisHelper.dataToPosition(array(this.getDatumPositionValues(datum, fields)), this._scaleConfig);
      };
    }

    return this._positionXEncoder(datum);
  }

  protected _positionYEncoder?: (datum: Datum) => number;

  dataToPositionY(datum: Datum): number {
    if (this._positionYEncoder) {
      return this._positionYEncoder(datum);
    }

    if (!this._yAxisHelper) {
      this._positionYEncoder = (datum: Datum) => Number.NaN;
      return Number.NaN;
    }
    const fields = this._yAxisHelper.getFields ? this._yAxisHelper.getFields() : this._fieldY;
    if (!fields || fields.length === 0) {
      this._positionYEncoder = (datum: Datum) => null;
      return null;
    }

    if (this._yAxisHelper.isContinuous) {
      this._positionYEncoder = (datum: Datum) => {
        this._scaleConfig.datum = datum;
        return this._yAxisHelper.valueToPosition(this.getDatumPositionValue(datum, fields[0]), this._scaleConfig);
      };
    } else {
      this._positionYEncoder = (datum: Datum) => {
        this._scaleConfig.datum = datum;
        return this._yAxisHelper.dataToPosition(array(this.getDatumPositionValues(datum, fields)), this._scaleConfig);
      };
    }

    return this._positionYEncoder(datum);
  }

  dataToPositionZ(datum: Datum): number {
    if (!this._zAxisHelper) {
      return Number.NaN;
    }
    const { dataToPosition } = this._zAxisHelper;

    return dataToPosition(this.getDatumPositionValues(datum, this._fieldZ), {
      bandPosition: this._bandPosition
    });
  }

  dataToPositionX1(datum: Datum): number {
    if (!this._xAxisHelper) {
      return Number.NaN;
    }
    return this._fieldX2 && this._fieldX2 in datum
      ? this.valueToPositionX(this.getDatumPositionValues(datum, this._fieldX2))
      : this.valueToPositionX(0);
  }

  dataToPositionY1(datum: Datum): number {
    if (!this._yAxisHelper) {
      return Number.NaN;
    }
    return this._fieldY2 && this._fieldY2 in datum
      ? this.valueToPositionY(this.getDatumPositionValues(datum, this._fieldY2))
      : this.valueToPositionY(0);
  }

  positionToData(p: IPoint): IPoint | null {
    if (!p) {
      return null;
    }
    return {
      x: this.positionToDataX(p.x),
      y: this.positionToDataY(p.y)
    };
  }

  positionToDataX(xPos: number): any | null {
    if (!this._scaleX) {
      return null;
    }
    return this._scaleX.invert(xPos);
  }

  positionToDataY(yPos: number): any | null {
    if (!this._scaleY) {
      return null;
    }
    return this._scaleY.invert(yPos);
  }

  getRegionRectLeft(): number {
    if (!this._xAxisHelper) {
      return Number.NaN;
    }
    const { getScale } = this._xAxisHelper;
    return getScale(0).range()[0];
  }

  getRegionRectRight(): number {
    if (!this._xAxisHelper) {
      return Number.NaN;
    }
    const { getScale } = this._xAxisHelper;
    return getScale(0).range()[1];
  }

  afterInitMark(): void {
    super.afterInitMark();
    this.setFieldX(this._fieldX);
    this.setFieldY(this._fieldY);
    this._trigger.setStateKeys([...this._fieldX, ...this._fieldY]);
    this._buildScaleConfig();
  }

  getDimensionField(): string[] {
    if (this._direction === Direction.vertical) {
      return this._specXField;
    }
    return this._specYField;
  }

  getMeasureField(): string[] {
    if (this._direction === Direction.vertical) {
      return this._specYField;
    }
    return this._specXField;
  }

  viewDataUpdate(d: DataView): void {
    super.viewDataUpdate(d);
    if (this.sortDataByAxis) {
      this._sortDataInAxisDomain();
    }
  }

  _sortDataInAxisDomain() {
    if (this.getViewData()?.latestData?.length) {
      sortDataInAxisHelper(
        this._direction === Direction.horizontal ? this._yAxisHelper : this._xAxisHelper,
        this._direction === Direction.horizontal ? this._fieldY[0] : this._fieldX[0],
        this.getViewData().latestData
      );
      this._data?.updateData(true);
    }
  }

  protected _getInvalidDefined = (datum: Datum) => {
    if (this._xAxisHelper?.isContinuous) {
      if (!couldBeValidNumber(datum[this._specXField[0]])) {
        return false;
      }
    }
    if (this._yAxisHelper?.isContinuous) {
      if (!couldBeValidNumber(datum[this._specYField[0]])) {
        return false;
      }
    }
    return true;
  };

  reInit(spec: T) {
    if (this._positionXEncoder) {
      this._positionXEncoder = null;
    }
    if (this._positionYEncoder) {
      this._positionYEncoder = null;
    }

    super.reInit(spec);
  }
}
