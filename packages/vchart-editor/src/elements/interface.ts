import type { EditorMode, IEditorController, IEditorElement, IEditorLayer, IHistory } from './../core/interface';
import type { IRect, IPoint } from '../typings/space';
import type { IGraphic } from '@visactor/vrender-core';
import type { EditorData } from '../core/editor-data';

export interface IElementOption extends Partial<IElementData> {
  layer: IEditorLayer;
  id?: string | number;
  controller: IEditorController;
  mode: EditorMode;
  editorData: EditorData;
  commonHistoryUse: IHistory['use'];
  getAllLayers?: () => IEditorLayer[];
}

export interface IElementData {
  rect: IRect;
  anchor?: IPoint;
  id: string | number;
  type: string;
  attribute: {
    [key: string]: any;
  };
}

export interface IElement {
  readonly isRendered: boolean;
  readonly id: string | number;

  pickable: boolean;
  overAble: boolean;
  tryPick: (e: VRenderPointerEvent) => void;

  /** lifecycle */
  initWithOption: () => void;
  afterAdd: () => void;
  release: () => void;

  /** handler */
  onAfterRender: (callBack: () => void) => void;

  setModel: (mode: EditorMode) => void;
  moveBy: (offsetX: number, offsetY: number) => void;
  updateAttributeFromHistory: (att: any) => void;
  getData: () => IElementData;
  getEditorElementsConnectBox: (rect: IRect) => IEditorElement[];
  startEditorElement: (el: IEditorElement, e: PointerEvent) => void;
  clearCurrentEditorElement: () => void;
}

export interface IElementConstructor {
  new (options: IElementOption): IElement;
}

export type VRenderPointerEvent = PointerEvent & { target: Partial<IGraphic> } & { canvas: { x: number; y: number } };
