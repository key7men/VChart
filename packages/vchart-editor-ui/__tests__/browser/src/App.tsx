import './App.css';
import {
  AxisPanel,
  ColorEditorBar,
  CustomEditorBar,
  CustomPanel,
  DataFormatPanel,
  EditorBar,
  LabelPanel,
  LineEditorBar,
  TextEditorBar,
  TitlePanel
} from '../../../src';

function App() {
  return (
    <div>
      <p>VChart Editor UI</p>
      <EditorBar style={{ marginBottom: 20 }} />
      <ColorEditorBar style={{ marginBottom: 20 }} />
      <LineEditorBar style={{ marginBottom: 20 }} />
      <TextEditorBar style={{ marginBottom: 20 }} />
      <CustomEditorBar
        style={{ marginBottom: 20 }}
        entries={[
          { key: 'chart' },
          { key: 'palette' },
          { key: 'fill' },
          { key: 'stroke' },
          { key: 'line' },
          { key: 'textColor' },
          { key: 'fontSize', default: 16 },

          { key: 'horizontalLine', divide: false },
          { key: 'verticalLine', divide: false },
          { key: 'horizontalRect', divide: false },
          { key: 'verticalRect', divide: false },
          { key: 'combineMark', divide: false },
          { key: 'sumDiff', divide: false },
          { key: 'hierarchyDiff', divide: false },
          { key: 'addText' },

          { key: 'bold' },

          { key: 'editData', divide: false },
          { key: 'comment', divide: false },
          { key: 'more', divide: false }
        ]}
      />
      <TitlePanel
        sections={{
          title: {
            label: '主标题',
            entries: [
              { key: 'text' },
              { key: 'fontSize', label: '字号' },
              { key: 'fontFamily', label: '字体' },
              { key: 'fontStyle', label: '样式' },
              { key: 'color', label: '颜色' }
            ]
          },
          subTitle: {
            label: '副标题',
            entries: [
              { key: 'display', label: '显示副标题' },
              { key: 'text' },
              { key: 'fontSize', label: '字号' },
              { key: 'fontFamily', label: '字体' },
              { key: 'fontStyle', label: '样式' },
              { key: 'color', label: '颜色' }
            ]
          },
          align: {
            label: '排列',
            entries: [
              {
                key: 'position',
                label: '显示位置',
                options: [
                  { value: 'left', label: '居左' },
                  { value: 'center', label: '居中' },
                  { value: 'right', label: '居右' }
                ]
              },
              { key: 'textAlign', label: '对齐方式' }
            ]
          }
        }}
      />
      <AxisPanel />
      <DataFormatPanel />
      <LabelPanel />
      <CustomPanel
        label="图形样式"
        componentMap={{
          count: 'sliderNumber',
          interval: 'sliderNumber',
          borderRadius: 'sliderNumber'
        }}
        sections={{
          bar: {
            entries: [
              { key: 'count', label: '柱体个数' },
              { key: 'interval', label: '柱间距', unit: '%', default: 50, min: 0, max: 100 },
              { key: 'borderRadius', label: '柱体圆角', unit: '%', default: 50, min: 0, max: 100 }
            ]
          }
        }}
      />
      <CustomPanel
        label="时间标注"
        sections={{
          time: {
            label: '当前时间',
            entries: [
              { key: 'switch', label: '显示当前时间' },
              { key: 'fontFamily', label: '字体' },
              { key: 'fontSize', label: '字号' },
              { key: 'fontStyle', label: '样式' },
              { key: 'color', label: '颜色' }
            ]
          },
          sum: {
            label: '总计',
            entries: [
              { key: 'switch', label: '显示总计' },
              { key: 'fontFamily', label: '字体' },
              { key: 'fontSize', label: '字号' },
              { key: 'fontStyle', label: '样式' },
              { key: 'color', label: '颜色' },
              { key: 'textAlign', label: '对齐方式' }
            ]
          }
        }}
      />
    </div>
  );
}

export default App;
