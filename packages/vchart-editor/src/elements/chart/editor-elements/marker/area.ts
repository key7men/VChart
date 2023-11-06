/**
 * @description 区域标注交互
 */
import type { IGroup, IGraphic, IPolygon, IRect, FederatedPointerEvent } from '@visactor/vrender-core';
// eslint-disable-next-line no-duplicate-imports
import { createRect, createGroup, vglobal, createPolygon } from '@visactor/vrender-core';
import type { IEditorElement } from '../../../../core/interface';
// eslint-disable-next-line no-duplicate-imports
import { clamp, merge } from '@visactor/vutils';
import type { MarkArea as MarkAreaComponent } from '@visactor/vrender-components';
import type { EventParams, MarkArea, IComponent } from '@visactor/vchart';
import { MarkerTypeEnum } from '../../interface';
import { BaseMarkerEditor } from './base';

const handlerWidth = 9;
const handlerHeight = 40;

type PointLike = {
  x: number;
  y: number;
  [key: string]: any;
};

export class MarkAreaEditor extends BaseMarkerEditor<MarkArea, MarkAreaComponent> {
  readonly type: string = 'markArea';
  private _orient: string;

  private _overlayAreaGroup: IGroup;
  private _overlayArea: IPolygon;
  private _overlayLabel: IRect;
  private _topHandler: IRect;
  private _bottomHandler: IRect;
  private _rightHandler: IRect;
  private _leftHandler: IRect;
  private _currentHandler: IRect;
  private _limitRange: [number, number];

  private _prePos: number = 0;

  protected _getEnableMarkerTypes(): string[] {
    return [MarkerTypeEnum.horizontalArea, MarkerTypeEnum.verticalArea];
  }

  protected _handlePointerDown(e: EventParams): void {
    this._orient = this._element.name === MarkerTypeEnum.verticalArea ? 'vertical' : 'horizontal';
    const el = this._getEditorElement(e);
    this.startEditor(el, e.event as PointerEvent);

    this._overlayAreaGroup?.showAll();

    const isHorizontal = this._orient === 'horizontal';
    const region = this._model.getRelativeSeries().getRegion();
    const { x: regionStartX, y: regionStartY } = region.getLayoutStartPoint();
    const { width: regionWidth, height: regionHeight } = region.getLayoutRect();
    if (isHorizontal) {
      this._limitRange = [regionStartY, regionStartY + regionHeight];
    } else {
      this._limitRange = [regionStartX, regionStartX + regionWidth];
    }

    this._prePos = this._orient === 'vertical' ? e.event.clientX : e.event.clientY;
    vglobal.addEventListener('pointermove', this._onAreaDrag);
    vglobal.addEventListener('pointerup', this._onAreaDragEnd);
    this._overlayAreaGroup.addEventListener('pointerdown', this._onAreaDragStart as EventListenerOrEventListenerObject);
  }

  // 创建 hover 浮层
  protected _getOverGraphic(el: IEditorElement): IGraphic {
    const model = el.model;
    const markArea = (model as IComponent).getVRenderComponents()[0];
    const areaShape = (markArea as unknown as MarkAreaComponent).getArea();
    const overlayArea = createPolygon(
      merge({}, areaShape.attribute, {
        lineWidth: 1,
        stroke: '#3073F2',
        pickable: false
      })
    );
    overlayArea.name = 'overlay-mark-area-area';

    return overlayArea;
  }

  // 创建交互编辑框
  protected _createEditorGraphic(el: IEditorElement): IGraphic {
    if (this._editComponent) {
      return this._editComponent;
    }

    const model = el.model;
    const overlayGraphic = createGroup({});
    const overlayAreaGroup = createGroup({
      x: 0,
      y: 0
    });
    overlayAreaGroup.name = 'overlay-mark-area-group';
    overlayGraphic.add(overlayAreaGroup);
    this._overlayAreaGroup = overlayAreaGroup;

    const markArea = (model as IComponent).getVRenderComponents()[0];
    const areaShape = (markArea as unknown as MarkAreaComponent).getArea();
    const points = areaShape.attribute.points;
    if (this._orient === 'vertical') {
      if (points[0].x <= points[2].x) {
        (points[0] as unknown as any).left = true;
        (points[1] as unknown as any).left = true;
        (points[2] as unknown as any).right = true;
        (points[3] as unknown as any).right = true;
      } else {
        (points[0] as unknown as any).right = true;
        (points[1] as unknown as any).right = true;
        (points[2] as unknown as any).left = true;
        (points[3] as unknown as any).left = true;
      }
    } else {
      if (points[0].y <= points[2].y) {
        (points[0] as unknown as any).top = true;
        (points[1] as unknown as any).top = true;
        (points[2] as unknown as any).bottom = true;
        (points[3] as unknown as any).bottom = true;
      } else {
        (points[0] as unknown as any).bottom = true;
        (points[1] as unknown as any).bottom = true;
        (points[2] as unknown as any).top = true;
        (points[3] as unknown as any).top = true;
      }
    }
    const overlayArea = createPolygon(
      merge({}, areaShape.attribute, {
        lineWidth: 1,
        stroke: '#3073F2',
        fill: '#005DFF',
        fillOpacity: 0.1
      })
    );
    overlayArea.name = 'overlay-mark-area-area';
    this._overlayArea = overlayArea;
    overlayAreaGroup.add(overlayArea);

    const labelShape = (markArea as unknown as MarkAreaComponent).getLabel() as unknown as IGroup;
    const overlayLabel = createRect({
      x: labelShape.AABBBounds.x1,
      y: labelShape.AABBBounds.y1,
      width: labelShape.AABBBounds.width(),
      height: labelShape.AABBBounds.height(),
      fill: '#3073F2',
      fillOpacity: 0.3,
      visible: false
    });
    overlayLabel.name = 'overlay-mark-area-label';
    this._overlayLabel = overlayLabel;
    overlayGraphic.add(overlayLabel);

    // 绘制 resize 的手柄
    const areaBounds = areaShape.AABBBounds;
    if (this._orient === 'vertical') {
      const rightHandler = createRect({
        x: areaBounds.x2 - handlerWidth / 2,
        y: (areaBounds.y1 + areaBounds.y2) / 2 - handlerHeight / 2,
        width: handlerWidth,
        height: handlerHeight,
        fill: '#3073F2',
        fillOpacity: 0.6,
        cornerRadius: 9,
        cursor: 'ew-resize',
        zIndex: 1
      });
      rightHandler.name = 'overlay-right-handler';
      overlayAreaGroup.add(rightHandler);
      this._rightHandler = rightHandler;

      const leftHandler = createRect({
        x: areaBounds.x1 - handlerWidth / 2,
        y: (areaBounds.y1 + areaBounds.y2) / 2 - handlerHeight / 2,
        width: handlerWidth,
        height: handlerHeight,
        fill: '#3073F2',
        fillOpacity: 0.6,
        cornerRadius: 9,
        cursor: 'ew-resize',
        zIndex: 1
      });
      leftHandler.name = 'overlay-left-handler';
      overlayAreaGroup.add(leftHandler);
      this._leftHandler = leftHandler;

      // resize 手柄的事件监听
      this._rightHandler.addEventListener(
        'pointerdown',
        this._onHandlerDragStart as EventListenerOrEventListenerObject
      );
      this._leftHandler.addEventListener('pointerdown', this._onHandlerDragStart as EventListenerOrEventListenerObject);
    } else {
      const topHandler = createRect({
        x: (areaBounds.x1 + areaBounds.x2) / 2 - handlerHeight / 2,
        y: areaBounds.y1 - handlerWidth / 2,
        width: handlerHeight,
        height: handlerWidth,
        fill: '#3073F2',
        fillOpacity: 0.6,
        cornerRadius: 9,
        cursor: 'ns-resize',
        zIndex: 1
      });
      topHandler.name = 'overlay-top-handler';
      overlayAreaGroup.add(topHandler);
      this._topHandler = topHandler;

      const bottomHandler = createRect({
        x: (areaBounds.x1 + areaBounds.x2) / 2 - handlerHeight / 2,
        y: areaBounds.y2 - handlerWidth / 2,
        width: handlerHeight,
        height: handlerWidth,
        fill: '#3073F2',
        fillOpacity: 0.6,
        cornerRadius: 9,
        cursor: 'ns-resize',
        zIndex: 1
      });
      bottomHandler.name = 'overlay-bottom-handler';
      overlayAreaGroup.add(bottomHandler);
      this._bottomHandler = bottomHandler;

      // resize 手柄的事件监听
      this._topHandler.addEventListener('pointerdown', this._onHandlerDragStart as EventListenerOrEventListenerObject);
      this._bottomHandler.addEventListener(
        'pointerdown',
        this._onHandlerDragStart as EventListenerOrEventListenerObject
      );
    }
    // overlayArea 添加事件
    this._layer.editorGroup.add(overlayGraphic as unknown as IGraphic);
    this._editComponent = overlayGraphic;
    return this._editComponent;
  }

  private _onHandlerDragStart = (e: FederatedPointerEvent) => {
    e.stopPropagation();

    const model = this._chart.vchart.getChart().getComponentByUserId(this._modelId) as unknown as MarkArea;
    this._element = model.getVRenderComponents()[0] as unknown as MarkAreaComponent;
    this._model = model;

    const handler = e.target;
    this._currentHandler = handler as unknown as IRect;

    this._prePos = this._orient === 'vertical' ? e.clientX : e.clientY;
    vglobal.addEventListener('pointermove', this._onHandlerDrag);
    vglobal.addEventListener('pointerup', this._onHandlerDragEnd);
  };

  private _onHandlerDrag = (e: any) => {
    e.stopPropagation();

    this._silentAllMarkers();
    this._editComponent.showAll();

    let currentPos;
    let delta = 0;
    let updateField;
    if (this._orient === 'horizontal') {
      currentPos = e.clientY;
      delta = currentPos - this._prePos;
      updateField = 'y';
    } else {
      currentPos = e.clientX;
      delta = currentPos - this._prePos;
      updateField = 'x';
    }
    this._prePos = currentPos;

    // 更新 area
    const overlayArea = this._overlayArea;
    const points = overlayArea.attribute.points;
    if (this._currentHandler.name === 'overlay-right-handler') {
      const changePoints = points.filter(point => (point as unknown as any).right);
      changePoints.forEach(point => {
        point.x += delta;
      });
    } else if (this._currentHandler.name === 'overlay-left-handler') {
      const changePoints = points.filter(point => (point as unknown as any).left);
      changePoints.forEach(point => {
        point.x += delta;
      });
    } else if (this._currentHandler.name === 'overlay-top-handler') {
      const changePoints = points.filter(point => (point as unknown as any).top);

      changePoints.forEach(point => {
        point.y = clamp(point.y + delta, this._limitRange[0], this._limitRange[1]);
      });
    } else if (this._currentHandler.name === 'overlay-bottom-handler') {
      const changePoints = points.filter(point => (point as unknown as any).bottom);
      changePoints.forEach(point => {
        point.y = clamp(point.y + delta, this._limitRange[0], this._limitRange[1]);
      });
    }
    overlayArea.setAttribute('points', points);

    // 更新 label
    const overlayLabel = this._overlayLabel;
    overlayLabel.setAttribute(
      updateField,
      this._orient === 'vertical'
        ? (overlayArea.AABBBounds.x1 + overlayArea.AABBBounds.x2) / 2 - overlayLabel.attribute.width / 2
        : (overlayArea.AABBBounds.y1 + overlayArea.AABBBounds.y2) / 2 - overlayLabel.attribute.height / 2
    );

    // 更新当前 handler
    this._currentHandler.setAttribute(
      updateField,
      clamp(
        this._currentHandler.attribute[updateField] + delta,
        this._limitRange[0] - handlerWidth / 2,
        this._limitRange[1] - handlerWidth / 2
      )
    );
  };

  private _onHandlerDragEnd = (e: any) => {
    e.preventDefault();

    const overlayArea = this._overlayArea;
    const points = overlayArea.attribute.points;
    this._overlayLabel.setAttribute('visible', false);
    this._activeAllMarkers();
    vglobal.removeEventListener('pointermove', this._onHandlerDrag);
    vglobal.removeEventListener('pointerup', this._onHandlerDragEnd);
    // 更新当前图形以及保存 spec
    this._save(points);
  };

  private _onAreaDragStart = (e: any) => {
    e.stopPropagation();

    const model = this._chart.vchart.getChart().getComponentByUserId(this._modelId) as unknown as MarkArea;
    this._element = model.getVRenderComponents()[0] as unknown as MarkAreaComponent;
    this._model = model;

    this._prePos = this._orient === 'vertical' ? e.clientX : e.clientY;
    vglobal.addEventListener('pointermove', this._onAreaDrag);
    vglobal.addEventListener('pointerup', this._onAreaDragEnd);
  };

  private _onAreaDrag = (e: any) => {
    e.stopPropagation();

    this._controller.removeOverGraphic();
    this._silentAllMarkers();
    this._editComponent.showAll();
    const overlayArea = this._overlayArea;
    let currentPos;
    let delta = 0;
    let updateField: string;
    if (this._orient === 'horizontal') {
      currentPos = e.clientY;
      delta = currentPos - this._prePos;
      updateField = 'y';
    } else {
      currentPos = e.clientX;
      delta = currentPos - this._prePos;
      updateField = 'x';
    }

    // 如果 area 已经移动在限制区域，就不再进行更新
    if (
      this._orient === 'horizontal' &&
      ((delta < 0 && Math.min(...overlayArea.attribute.points.map(point => point.y)) === this._limitRange[0]) ||
        (delta > 0 && Math.max(...overlayArea.attribute.points.map(point => point.y)) === this._limitRange[1]))
    ) {
      return;
    }
    if (
      this._orient === 'vertical' &&
      ((delta < 0 && Math.min(...overlayArea.attribute.points.map(point => point.x)) === this._limitRange[0]) ||
        (delta > 0 && Math.max(...overlayArea.attribute.points.map(point => point.x)) === this._limitRange[1]))
    ) {
      return;
    }

    this._prePos = currentPos;
    const [limitStart, limitEnd] = this._limitRange;

    // 更新 area
    const points = overlayArea.attribute.points;
    overlayArea.setAttribute(
      'points',
      points.map(point => {
        point[updateField] = clamp(point[updateField] + delta, limitStart, limitEnd);
        return point;
      })
    );

    // 更新当前 label, handler
    const overlayLabel = this._overlayLabel;
    if (this._orient === 'vertical') {
      overlayLabel.setAttribute(
        updateField,
        (overlayArea.AABBBounds.x1 + overlayArea.AABBBounds.x2) / 2 - overlayLabel.attribute.width / 2
      );
      this._rightHandler.setAttribute(
        updateField,
        clamp(
          this._rightHandler.attribute[updateField] + delta,
          limitStart - handlerWidth / 2,
          limitEnd - handlerWidth / 2
        )
      );
      this._leftHandler.setAttribute(
        updateField,
        clamp(
          this._leftHandler.attribute[updateField] + delta,
          limitStart - handlerWidth / 2,
          limitEnd - handlerWidth / 2
        )
      );
    } else {
      overlayLabel.setAttribute(
        updateField,
        (overlayArea.AABBBounds.y1 + overlayArea.AABBBounds.y2) / 2 - overlayLabel.attribute.height / 2
      );
      this._topHandler.setAttribute(
        updateField,
        clamp(
          this._topHandler.attribute[updateField] + delta,
          limitStart - handlerWidth / 2,
          limitEnd - handlerWidth / 2
        )
      );
      this._bottomHandler.setAttribute(
        updateField,
        clamp(
          this._bottomHandler.attribute[updateField] + delta,
          limitStart - handlerWidth / 2,
          limitEnd - handlerWidth / 2
        )
      );
    }
  };

  private _onAreaDragEnd = (e: any) => {
    e.preventDefault();

    const overlayArea = this._overlayArea;
    const points = overlayArea.attribute.points;
    this._editComponent.setAttribute('pickable', false);
    this._overlayLabel.setAttributes({
      visible: false,
      pickable: false
    });
    this._activeAllMarkers();
    vglobal.removeEventListener('pointermove', this._onAreaDrag);
    vglobal.removeEventListener('pointerup', this._onAreaDragEnd);

    // 更新当前图形以及保存 spec
    this._save(points);
  };

  private _save(newPoints: PointLike[]) {
    // 更新真正的图形
    this._element?.setAttributes({
      points: newPoints.map(point => {
        return {
          x: point.x,
          y: point.y
        };
      })
    });

    // 更新 spec
    const series = this._model.getRelativeSeries();
    const { x: regionStartX, y: regionStartY } = series.getRegion().getLayoutStartPoint();
    const { width: regionWidth, height: regionHeight } = series.getRegion().getLayoutRect();

    let positionSpec;
    if (this._orient === 'horizontal') {
      const bottomY = newPoints.find(point => point.bottom).y;
      const topY = newPoints.find(point => point.top).y;
      positionSpec = {
        y: `${((bottomY - regionStartY) / regionHeight) * 100}%`,
        y1: `${((topY - regionStartY) / regionHeight) * 100}%`
      };
    } else {
      const leftX = newPoints.find(point => point.left).x;
      const rightX = newPoints.find(point => point.right).x;
      positionSpec = {
        x: `${((leftX - regionStartX) / regionWidth) * 100}%`,
        x1: `${((rightX - regionStartX) / regionWidth) * 100}%`
      };
    }

    const newMarkAreaSpec = merge({}, this._model.getSpec(), positionSpec);

    this._updateAndSave(newMarkAreaSpec, 'markArea');
  }
}
