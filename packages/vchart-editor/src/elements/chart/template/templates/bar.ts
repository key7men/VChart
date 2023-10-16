import { cloneDeep } from '@visactor/vutils';
import type { StandardData } from '../../data/interface';
import type { DataInfo } from '../../data/interface';
import { BaseTemp } from './baseTemp';

const spec = {
  type: 'common',
  // background: 'transparent',
  series: [
    {
      id: 'bar-0',
      type: 'bar',
      xField: 'State',
      yField: 'Population',
      seriesField: 'Age',
      stack: true,
      bar: {
        // The state style of bar
        state: {
          hover: {
            stroke: '#000',
            lineWidth: 1
          }
        }
      }
    }
  ],
  axes: [
    {
      orient: 'left',
      id: 'axis-left',
      type: 'linear'
    },
    {
      orient: 'bottom',
      id: 'axis-bottom',
      type: 'band'
    }
  ],
  data: [
    {
      id: 'barData',
      values: [
        {
          State: 'WY',
          Age: 'Under 5 Years',
          Population: 25635
        },
        {
          State: 'WY',
          Age: '5 to 13 Years',
          Population: 1890
        },
        {
          State: 'WY',
          Age: '14 to 17 Years',
          Population: 9314
        },
        {
          State: 'DC',
          Age: 'Under 5 Years',
          Population: 30352
        },
        {
          State: 'DC',
          Age: '5 to 13 Years',
          Population: 20439
        },
        {
          State: 'DC',
          Age: '14 to 17 Years',
          Population: 10225
        },
        {
          State: 'VT',
          Age: 'Under 5 Years',
          Population: 38253
        },
        {
          State: 'VT',
          Age: '5 to 13 Years',
          Population: 42538
        },
        {
          State: 'VT',
          Age: '14 to 17 Years',
          Population: 15757
        },
        {
          State: 'ND',
          Age: 'Under 5 Years',
          Population: 51896
        },
        {
          State: 'ND',
          Age: '5 to 13 Years',
          Population: 67358
        },
        {
          State: 'ND',
          Age: '14 to 17 Years',
          Population: 18794
        },
        {
          State: 'AK',
          Age: 'Under 5 Years',
          Population: 72083
        },
        {
          State: 'AK',
          Age: '5 to 13 Years',
          Population: 85640
        },
        {
          State: 'AK',
          Age: '14 to 17 Years',
          Population: 22153
        }
      ]
    }
  ],
  legends: {
    id: 'legend-discrete',
    visible: true
  },
  region: [
    {
      id: 'region-0',
      style: {
        // fill: 'red'
      }
    }
  ],
  tooltip: {
    visible: true
  },

  // TODO: 变成默认的配置
  markLine: [
    // // 均值线
    // {
    //   name: 'avgMarkLineVertical',
    //   interactive: true,
    //   y: 'average',
    //   endSymbol: {
    //     visible: true,
    //     size: 12,
    //     refX: 6,
    //     symbolType: 'triangleLeft',
    //     autoRotate: false
    //   },
    //   label: {
    //     visible: true,
    //     autoRotate: false,
    //     formatMethod: markData => {
    //       return parseInt(markData[0].y, 10);
    //     },
    //     position: 'end',
    //     labelBackground: {
    //       visible: false
    //     },
    //     style: {
    //       fill: '#000'
    //     },
    //     refX: 12,
    //     refY: 0
    //   },
    //   line: {
    //     style: {
    //       stroke: '#000'
    //     }
    //   }
    // },
    // {
    //   name: 'avgMarkLineHorizontal',
    //   interactive: true,
    //   x: 'VT',
    //   endSymbol: {
    //     visible: true,
    //     size: 12,
    //     refX: 6,
    //     symbolType: 'triangleDown',
    //     autoRotate: false
    //   },
    //   label: {
    //     visible: true,
    //     autoRotate: false,
    //     text: 'VT',
    //     position: 'end',
    //     labelBackground: {
    //       visible: false
    //     },
    //     style: {
    //       fill: '#000',
    //       textAlign: 'center',
    //       textBaseline: 'bottom'
    //     },
    //     refX: 12,
    //     refY: 0
    //   },
    //   line: {
    //     style: {
    //       stroke: '#000'
    //     }
    //   }
    // },
    // // 复合增长箭头，默认为第一维度和最后一个维度的值差异，TODO：需要根据图表的spec 来获取初始 coordinates
    // {
    //   coordinates: [
    //     {
    //       State: 'WY',
    //       Age: 'Under 5 Years',
    //       Population: 25635
    //     },
    //     {
    //       State: 'AK',
    //       Age: 'Under 5 Years',
    //       Population: 72083
    //     }
    //   ],
    //   line: {
    //     style: {
    //       lineDash: [0],
    //       lineWidth: 2,
    //       stroke: '#000'
    //     }
    //   },
    //   label: {
    //     position: 'middle',
    //     text: (((22153 + 85640 + 72083 - 25635 + 1890 + 9314) / (25635 + 1890 + 9314)) * 100).toFixed(0) + '%',
    //     labelBackground: {
    //       style: {
    //         fill: '#fff',
    //         fillOpacity: 1,
    //         stroke: '#000',
    //         lineWidth: 1,
    //         cornerRadius: 4
    //       }
    //     },
    //     style: {
    //       fill: '#000'
    //     }
    //   },
    //   endSymbol: {
    //     size: 12,
    //     refX: -6
    //   },
    //   offsetY: -50,
    //   interactive: true,
    //   name: 'growthMarkLine'
    // },
    // 总计差异
    {
      type: 'type-step',
      coordinates: [
        {
          State: 'WY',
          Age: 'Under 5 Years',
          Population: 25635
        },
        {
          State: 'AK',
          Age: 'Under 5 Years',
          Population: 72083
        }
      ],
      connectDirection: 'top',
      expandDistance: 30,
      line: {
        style: {
          lineDash: [0],
          lineWidth: 2,
          stroke: '#000',
          cornerRadius: 4
        }
      },
      label: {
        position: 'middle',
        text: 'ssss',
        labelBackground: {
          style: {
            fill: '#fff',
            fillOpacity: 1,
            stroke: '#000',
            lineWidth: 1,
            cornerRadius: 4
          }
        },
        style: {
          fill: '#000'
        }
      },
      endSymbol: {
        size: 12,
        refX: -6
      },
      interactive: true,
      name: 'totalDiffMarkLine'
    },
    {
      line: {
        style: {
          lineDash: [0],
          stroke: '#000',
          lineWidth: 2,
          cornerRadius: 4
        }
      },
      startSymbol: {
        visible: false,
        symbolType: 'triangle',
        size: 10,
        style: {
          stroke: null,
          lineWidth: 0,
          fill: 'rgba(46, 47, 50)'
        }
      },
      endSymbol: {
        visible: true,
        symbolType: 'triangle',
        size: 12,
        style: {
          stroke: null,
          lineWidth: 0,
          fill: 'rgba(46, 47, 50)'
        },
        refX: -6
      },
      label: {
        refY: 5,
        style: {
          fontSize: 14,
          fontWeight: 'normal',
          fontStyle: 'normal',
          fill: '#000',
          stroke: '#ffffff',
          lineWidth: 0
        },
        labelBackground: {
          padding: {
            top: 2,
            bottom: 2,
            right: 4,
            left: 4
          },
          style: {
            cornerRadius: 4,
            fill: '#fff',
            fillOpacity: 1,
            stroke: '#000',
            lineWidth: 1
          }
        },
        position: 'middle',
        text: '-93%'
      },
      type: 'type-step',
      coordinates: [
        {
          State: 'WY',
          Age: 'Under 5 Years',
          Population: 25635,
          __VCHART_DEFAULT_DATA_INDEX: 0,
          __VCHART_DEFAULT_DATA_KEY: 0,
          __VCHART_STACK_END: 25635,
          __VCHART_STACK_START: 0,
          __VCHART_STACK_START_PERCENT: 0,
          __VCHART_STACK_END_PERCENT: 1,
          __VCHART_STACK_TOTAL: 25635,
          __VCHART_STACK_TOTAL_PERCENT: 1,
          __VCHART_STACK_TOTAL_TOP: true,
          VGRAMMAR_DATA_ID_KEY_17: 0
        },
        {
          State: 'WY',
          Age: '5 to 13 Years',
          Population: 1890,
          __VCHART_DEFAULT_DATA_INDEX: 1,
          __VCHART_DEFAULT_DATA_KEY: 1,
          __VCHART_STACK_END: 1890,
          __VCHART_STACK_START: 0,
          __VCHART_STACK_START_PERCENT: 0,
          __VCHART_STACK_END_PERCENT: 1,
          __VCHART_STACK_TOTAL: 1890,
          __VCHART_STACK_TOTAL_PERCENT: 1,
          __VCHART_STACK_TOTAL_TOP: true,
          VGRAMMAR_DATA_ID_KEY_17: 1
        }
      ],
      connectDirection: 'top',
      expandDistance: 30,
      interactive: true,
      name: 'totalDiffMarkLine'
    }
  ]
  // 区域标注
  // markArea: [
  //   {
  //     name: 'markAreaVertical',
  //     x: 'WY',
  //     x1: 'DC',
  //     zIndex: 500,
  //     interactive: true,
  //     area: {
  //       style: {
  //         fill: '#005DFF',
  //         fillOpacity: '0.1'
  //       }
  //     },
  //     label: {
  //       position: 'top',
  //       text: 'insert some text',
  //       labelBackground: {
  //         visible: false
  //       },
  //       style: {
  //         fill: '#000'
  //       }
  //     }
  //   },
  //   {
  //     name: 'markAreaHorizontal',
  //     y: 40000,
  //     y1: 50000,
  //     zIndex: 500,
  //     interactive: true,
  //     area: {
  //       style: {
  //         fill: '#005DFF',
  //         fillOpacity: '0.1'
  //       }
  //     },
  //     label: {
  //       position: 'right',
  //       text: 'insert some text',
  //       labelBackground: {
  //         visible: false
  //       },
  //       style: {
  //         fill: '#000'
  //       }
  //     }
  //   }
  // ],
};

export class BarTemp extends BaseTemp {
  type = 'bar';
  checkDataEnable(data: StandardData, info: DataInfo, opt?: any): boolean {
    const xField: string[] = [];
    const yField: string[] = [];
    Object.keys(info).forEach(key => {
      if (info[key].type === 'linear') {
        yField.length === 0 && yField.push(key);
      } else if (info[key].type === 'ordinal') {
        xField.push(key);
      }
    });
    if (xField.length === 0 || yField.length === 0) {
      return false;
    }
    return true;
  }
  getSpec(data: StandardData, info: DataInfo, opt?: any) {
    const tempSpec = cloneDeep(spec);
    tempSpec.data = [data];
    const xField: string[] = [];
    const yField: string[] = [];
    Object.keys(info).forEach(key => {
      if (info[key].type === 'linear') {
        yField.length === 0 && yField.push(key);
      } else if (info[key].type === 'ordinal') {
        xField.push(key);
      }
    });
    if (xField.length === 0 || yField.length === 0) {
      return null;
    }
    tempSpec.series[0].xField = xField;
    tempSpec.series[0].yField = yField;
    tempSpec.series[0].dataId = data.name;
    return tempSpec;
  }
}
