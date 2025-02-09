import type { IVChart, IData, IInitOption, ISpec, IVChartConstructor } from '@visactor/vchart';
import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';
import withContainer, { ContainerProps } from '../containers/withContainer';
import RootChartContext, { ChartContextType } from '../context/chart';
import type { IView } from '@visactor/vgrammar-core';
import { isEqual, pickWithout } from '@visactor/vutils';
import ViewContext from '../context/view';
import { toArray } from '../util';
import { REACT_PRIVATE_PROPS } from '../constants';
import { IMarkElement } from '../components';
import {
  bindEventsToChart,
  EventsProps,
  CHART_EVENTS_KEYS,
  CHART_EVENTS,
  LegendEventProps,
  ScrollBarEventProps,
  BrushEventProps,
  DataZoomEventProps,
  PlayerEventProps,
  DimensionEventProps,
  HierarchyEventProps,
  ChartLifeCycleEventProps
} from '../eventsUtils';

export type ChartOptions = Omit<IInitOption, 'dom'>;

export interface BaseChartProps
  extends EventsProps,
    LegendEventProps,
    ScrollBarEventProps,
    BrushEventProps,
    DataZoomEventProps,
    PlayerEventProps,
    DimensionEventProps,
    HierarchyEventProps,
    ChartLifeCycleEventProps {
  vchartConstrouctor?: IVChartConstructor;
  type?: string;
  /** 上层container */
  container?: HTMLDivElement;
  /**
   * used only by <VChart />
   */
  spec?: ISpec;
  /** 数据 */
  data?: IData;
  /** 画布宽度 */
  width?: number;
  /** 画布高度 */
  height?: number;
  /** 图表配置 */
  options?: ChartOptions;
  /** skip function diff when component update */
  skipFunctionDiff?: boolean;
  /** 图表渲染完成事件 */
  onReady?: (instance: IVChart, isInitial: boolean) => void;
  /** throw error when chart run into an error */
  onError?: (err: Error) => void;
  /**
   * use sync render
   *
   * @since 1.8.3
   **/
  useSyncRender?: boolean;
}

type Props = React.PropsWithChildren<BaseChartProps>;

const notSpecKeys = [
  ...REACT_PRIVATE_PROPS,
  ...CHART_EVENTS_KEYS,
  'skipFunctionDiff',
  'onError',
  'onReady',
  'spec',
  'container',
  'options'
];

const BaseChart: React.FC<Props> = React.forwardRef((props, ref) => {
  const [updateId, setUpdateId] = useState<number>(0);
  const chartContext = useRef<ChartContextType>({
    specFromChildren: {}
  });
  useImperativeHandle(ref, () => chartContext.current?.chart);
  const hasSpec = !!props.spec;
  const [view, setView] = useState<IView>(null);
  const isUnmount = useRef<boolean>(false);
  const prevSpec = useRef(pickWithout(props, notSpecKeys));
  const eventsBinded = React.useRef<BaseChartProps>(null);
  const skipFunctionDiff = !!props.skipFunctionDiff;
  const useSyncRender = !!props.useSyncRender;

  const parseSpec = (props: Props) => {
    if (hasSpec && props.spec) {
      return props.spec;
    }

    return {
      ...prevSpec.current,
      ...chartContext.current?.specFromChildren
    };
  };

  const createChart = (props: Props) => {
    const cs = new props.vchartConstrouctor(parseSpec(props), {
      ...props.options,
      onError: props.onError,
      autoFit: true,
      dom: props.container
    });
    chartContext.current = { ...chartContext.current, chart: cs };
  };

  const handleChartRender = () => {
    // rebind events after render
    if (!isUnmount.current) {
      if (!chartContext.current || !chartContext.current.chart) {
        return;
      }

      bindEventsToChart(chartContext.current.chart, props, eventsBinded.current, CHART_EVENTS);

      const newView = chartContext.current.chart.getCompiler().getVGrammarView();

      setUpdateId(updateId + 1);
      if (props.onReady) {
        props.onReady(chartContext.current.chart, updateId === 0);
      }
      setView(newView);
    }
  };

  const renderChart = () => {
    if (chartContext.current.chart) {
      if (useSyncRender) {
        chartContext.current.chart.renderSync();
        handleChartRender();
      } else {
        // eslint-disable-next-line promise/catch-or-return
        chartContext.current.chart.renderAsync().then(handleChartRender);
      }
    }
  };

  useEffect(() => {
    if (!chartContext.current?.chart) {
      createChart(props);
      renderChart();
      bindEventsToChart(chartContext.current.chart, props, null, CHART_EVENTS);
      chartContext.current = {
        ...chartContext.current,
        isChildrenUpdated: false
      };
      eventsBinded.current = props;
      return;
    }

    if (hasSpec) {
      if (!isEqual(eventsBinded.current.spec, props.spec, { skipFunction: skipFunctionDiff })) {
        eventsBinded.current = props;
        if (useSyncRender) {
          chartContext.current.chart.updateSpecSync(parseSpec(props), undefined, {
            morph: false,
            enableExitAnimation: false
          });
          handleChartRender();
        } else {
          // eslint-disable-next-line promise/catch-or-return
          chartContext.current.chart
            .updateSpec(parseSpec(props), undefined, { morph: false, enableExitAnimation: false }) // morph临时关掉
            .then(handleChartRender);
        }
      }
      return;
    }

    const newSpec = pickWithout(props, notSpecKeys);

    if (
      !isEqual(newSpec, prevSpec.current, { skipFunction: skipFunctionDiff }) ||
      chartContext.current.isChildrenUpdated
    ) {
      prevSpec.current = newSpec;

      if (useSyncRender) {
        chartContext.current.chart.updateSpecSync(parseSpec(props), undefined, {
          morph: false,
          enableExitAnimation: false
        });
        handleChartRender();
      } else {
        // eslint-disable-next-line promise/catch-or-return
        chartContext.current.chart
          .updateSpec(parseSpec(props), undefined, { morph: false, enableExitAnimation: false }) // morph临时关掉
          .then(handleChartRender);
      }
    }
    chartContext.current = {
      ...chartContext.current,
      isChildrenUpdated: false
    };
  }, [props]);

  useEffect(() => {
    return () => {
      if (chartContext) {
        if (chartContext.current.chart) {
          chartContext.current.chart.release();
        }
        chartContext.current = null;
      }
      isUnmount.current = true;
    };
  }, []);

  return (
    <RootChartContext.Provider value={chartContext.current}>
      <ViewContext.Provider value={view}>
        {toArray(props.children).map((child, index) => {
          return (
            <React.Fragment key={(child as any)?.props?.id ?? (child as any)?.id ?? `child-${index}`}>
              {React.cloneElement(child as IMarkElement, {
                updateId: updateId
              })}
            </React.Fragment>
          );
        })}
      </ViewContext.Provider>
    </RootChartContext.Provider>
  );
});

export const createChart = <T extends Props>(
  componentName: string,
  defaultProps?: Partial<T>,
  callback?: (props: T, defaultProps?: Partial<T>) => T
) => {
  const Com = withContainer<ContainerProps, T>(BaseChart as any, componentName, (props: T) => {
    if (callback) {
      return callback(props, defaultProps);
    }

    if (defaultProps) {
      return Object.assign(props, defaultProps);
    }
    return props;
  });
  Com.displayName = componentName;
  return Com;
};
