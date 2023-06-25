import { Factory } from './core/factory';
import { VChart } from './export/core';
import {
  AreaChart,
  LineChart,
  BarChart,
  Bar3dChart,
  ScatterChart,
  MapChart,
  PieChart,
  Pie3dChart,
  RoseChart,
  RadarChart,
  CommonChart,
  SequenceChart,
  HistogramChart,
  Histogram3dChart,
  CircularProgressChart,
  WordCloudChart,
  WordCloud3dChart,
  FunnelChart,
  Funnel3dChart,
  LinearProgressChart,
  RangeColumnChart,
  RangeColumn3dChart,
  SunburstChart,
  CirclePackingChart,
  TreeMapChart,
  WaterfallChart,
  BoxPlotChart,
  SankeyChart,
  GaugeChart,
  RangeAreaChart,
  HeatmapChart
} from './export/chart';
import {
  LineSeries,
  AreaSeries,
  BarSeries,
  Bar3dSeries,
  ScatterSeries,
  MapSeries,
  PieSeries,
  Pie3dSeries,
  RoseSeries,
  RadarSeries,
  DotSeries,
  LinkSeries,
  CircularProgressSeries,
  WordCloud3dSeries,
  WordCloudSeries,
  FunnelSeries,
  Funnel3dSeries,
  LinearProgressSeries,
  RangeColumnSeries,
  RangeColumn3dSeries,
  TreeMapSeries,
  SunburstSeries,
  CirclePackingSeries,
  WaterfallSeries,
  BoxPlotSeries,
  SankeySeries,
  GaugePointerSeries,
  GaugeSeries,
  RangeAreaSeries,
  HeatmapSeries
} from './export/series';

import {
  SymbolMark,
  LineMark,
  RuleMark,
  TextMark,
  AreaMark,
  RectMark,
  Rect3dMark,
  PathMark,
  ArcMark,
  Arc3dMark,
  GroupMark,
  PolygonMark,
  Pyramid3dMark,
  BoxPlotMark,
  LinkPathMark,
  ProgressArcMark,
  CellMark,
  ComponentMark
} from './export/mark';

import {
  CartesianAxis,
  CartesianLinearAxis,
  CartesianBandAxis,
  CartesianTimeAxis,
  PolarAxis,
  PolarBandAxis,
  PolarLinearAxis,
  DiscreteLegend,
  ContinuousLegend,
  Tooltip,
  CartesianCrossHair,
  PolarCrossHair,
  DataZoom,
  ScrollBar,
  Indicator,
  GeoCoordinate,
  MarkLine,
  Title,
  MarkArea,
  Player,
  Label,
  MarkPoint,
  Brush,
  CustomMark,
  MapLabelComponent
} from './export/component';
import { GridLayout, Layout3d } from './export/layout';

// charts
VChart.useChart([
  AreaChart,
  LineChart,
  BarChart,
  Bar3dChart,
  ScatterChart,
  MapChart,
  PieChart,
  Pie3dChart,
  RoseChart,
  RadarChart,
  CommonChart,
  SequenceChart,
  HistogramChart,
  Histogram3dChart,
  CircularProgressChart,
  WordCloudChart,
  WordCloud3dChart,
  FunnelChart,
  Funnel3dChart,
  LinearProgressChart,
  RangeColumnChart,
  RangeColumn3dChart,
  SunburstChart,
  CirclePackingChart,
  TreeMapChart,
  WaterfallChart,
  BoxPlotChart,
  SankeyChart,
  GaugeChart,
  RangeAreaChart,
  HeatmapChart
]);

// series
VChart.useSeries([
  LineSeries,
  AreaSeries,
  BarSeries,
  Bar3dSeries,
  ScatterSeries,
  MapSeries,
  PieSeries,
  Pie3dSeries,
  RoseSeries,
  RadarSeries,
  DotSeries,
  LinkSeries,
  CircularProgressSeries,
  WordCloud3dSeries,
  WordCloudSeries,
  FunnelSeries,
  Funnel3dSeries,
  LinearProgressSeries,
  RangeColumnSeries,
  RangeColumn3dSeries,
  TreeMapSeries,
  SunburstSeries,
  CirclePackingSeries,
  WaterfallSeries,
  BoxPlotSeries,
  SankeySeries,
  GaugePointerSeries,
  GaugeSeries,
  RangeAreaSeries,
  HeatmapSeries
]);

// marks
VChart.useMark([
  SymbolMark,
  LineMark,
  RuleMark,
  TextMark,
  AreaMark,
  RectMark,
  Rect3dMark,
  PathMark,
  ArcMark,
  Arc3dMark,
  GroupMark,
  PolygonMark,
  Pyramid3dMark,
  BoxPlotMark,
  LinkPathMark,
  ProgressArcMark,
  CellMark,
  ComponentMark
]);

// components
VChart.useComponent([
  CartesianAxis as any,
  CartesianLinearAxis,
  CartesianBandAxis,
  CartesianTimeAxis,
  PolarAxis as any,
  PolarBandAxis,
  PolarLinearAxis,
  DiscreteLegend,
  ContinuousLegend,
  Tooltip,
  CartesianCrossHair,
  PolarCrossHair,
  DataZoom,
  ScrollBar,
  Indicator,
  GeoCoordinate,
  MarkLine,
  Title,
  MarkArea,
  Player,
  Label,
  MarkPoint,
  Brush,
  CustomMark,
  MapLabelComponent
]);

// layout
Factory.registerLayout('grid', GridLayout as any);
Factory.registerLayout('layout3d', Layout3d as any);

export { VChart };
