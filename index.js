/**
 * Created by 王冬 on 2018/12/03.
 * QQ: 20004604
 * weChat: qq20004604
 * ————————————————————
 * 数据结构要求：
 * 1、显示数据
 * [
 *    {
 *      title: '第1月',
 *      list: [
 *        {
 *          id: 1,    // 唯一
 *          name: '名字',   // 某一行数据的名字
 *          count: 100,   // 某一行具体的数据
 *        },
 *        // id:2、3 的数据，注意同一个数据在不同时间，他的 id 需要一致
 *      ]
 *    },
 *    // 第二月、第三月...
 * ]
 * ————————————————
 * 2、颜色数据（可选）（未提供的情况下使用随机颜色）
 * [
 *    {
 *      id: '1',    // 该id
 *      color: 'red'    // 该id的颜色
 *    }
 * ]
 * ————————————————
 */
import React from "react";
import s from './style/animation.css';

/* ———————— config ———————— */
// 一轮动画的时间
let DURATION_ONE_TURN = 3000;
// 顺序浮动时，从开始移动到移动结束时需要的时间（单位：毫秒）
let MOVING_TIME = 1200;
// 透明度变换时间（隐藏→显示 | 显示→隐藏 的耗时）（单位：毫秒）
let OPACITY_TIME = 1500;

/* ———————— config(end) ———————— */

function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

function randomColor() {
  let color = randomRange(0, 0xFFFFFF);
  return '#' + ('000000' + color.toString(16)).slice(-6);
};

class AnimationItem extends React.Component {
  render() {
    const {
      item,     // 数据，包含 name（名字）、count（数值）
      MAXCOUNT,   // 最大数值
    } = this.props;

    const {
      name,   // 名字
      count,    // 数值
      countIndex,   // count 的降序索引
      Color,    // 颜色
    } = item;

    // 高度位置 0~9显示，大于9不显示或者浮动到最下面
    const top = countIndex < 10 ? countIndex * 40 : 400;
    const opacity = countIndex < 10 ? '1' : '0';

    const style = {
      top: `${top + 50}px`,
      opacity: opacity,
      transition: `top ${MOVING_TIME / 1000}s linear, opacity ${OPACITY_TIME / 1000}s`,
    };

    const width = (count / MAXCOUNT) * 500;

    return <div className={s['row']} style={style}>
      {/* 名字 */}
      <div className={s['name']}>{name}</div>

      {/* 横条 + 数据 */}
      <div className={s["data-item"]}>
        <div className={s["item"]} style={{width: `${width}px`, backgroundColor: Color}}>
          {
            name.length * 12 + 10 < width ? <span className={s['item-text']}>{name}</span> : null
          }
        </div>
        <div className={s["count"]}>{count}</div>
      </div>
    </div>;
  }
}

// 容器
class Container extends React.Component {
  state = {
    list: [],   // 数据源
    index: -1,    // 当前序列
  };

  _timer = 0;   // 定时器

  _color = [];    // 颜色列表

  _lastAnimationTime = -1;  // 最后一次开始执行动画的时间

  render() {
    const {list, index} = this.state;
    if (list.length === 0 || index < 0) {
      return <div id={s['box']}>
        没有数据
      </div>;
    }

    const obj = list[index];

    return <div id={s['box']}>
      <div className={s['title']}>{obj.title}</div>
      {/* 参考线 */}
      <div className={s['line']}></div>

      {/*一行*/}
      {
        obj.list.map((item, index) => {
          return <AnimationItem key={item.id}
                                index={index}
                                MAXCOUNT={obj.MAXCOUNT}
                                item={item}/>;
        })
      }
    </div>;
  }

  // 初始化数据（异步，和动画分开执行）
  setData = (list, colorConfigList) => {
    this._color = new Map();
    clearInterval(this._timer);
    this.setState({
      list: this._sortList(list, colorConfigList),
    });
  };

  /**
   * 手动执行动画（手动调用这个的时候，要求和 setData 的逻辑不能同时执行）
   */
  action = () => {
    clearInterval(this._timer);
    // 重开显示时
    if (this.state.index > 0) {
      this.setState({
        index: 0
      });

      setTimeout(() => {
        this.setState({
          index: 1
        });

        this._setInterval();
      }, 2000);
    } else {
      // 第一次显示时
      this.setState({
        index: 0
      });
      setTimeout(() => {
        this.setState({
          index: 1
        });
      }, 100);
      this._setInterval();
    }
  };

  /**
   * 同步动画，即赋值后立刻开始动画
   * @param list    显示的数据
   * @param colorConfigList   颜色列表，可选
   */
  actionSync = (list, colorConfigList) => {
    this._color = new Map();
    clearInterval(this._timer);
    this.setState({
      list: this._sortList(list, colorConfigList),
      index: -1
    }, () => {
      this.action();
    });
  };

  /**
   * 追加数据，数据追加到原数据末尾。会【继续 | 立即开始】动画
   * tips: 注意，这个方法和 actionSync 不能前后连续调用，否则会导致数据丢失
   * @param list  追加的数据
   */
  addMoreData = (list, colorConfigList) => {
    // 三种情况：
    // 1、还没添加数据，走正常流程
    // 2、数据显示（即索引）未到末尾，此时直接将数据追加到末尾即可；
    // 3、数据已经显示结束，此时先需要追加，然后重新让数据动起来；

    // 如果是全新开始
    const isFirst = this.state.list.length === 0;
    if (isFirst) {
      this.actionSync(list, colorConfigList);
      return;
    }

    // 如果不是结束，添加数据，结束掉这段逻辑
    const isEnd = this.state.list.length === this.state.index + 1;
    if (!isEnd) {
      this.setState({
        list: this.state.list.concat(this._sortList(list, colorConfigList, true))
      });
      return;
    }

    // 当前时间距离上一次执行的间隔，是否小于最小间隔（小于则timeout的值大于0）
    // 如果小于，则 delay 到最小间隔的时间后，再执行代码；否则立即执行
    let timeout = DURATION_ONE_TURN - (Number(new Date()) - this._lastAnimationTime);

    // 最后情况，是结束后添加数据，这个时候需要他动起来
    setTimeout(() => {
      this.setState({
        list: this.state.list.concat(this._sortList(list, colorConfigList, true))
      }, () => {
        this.setState({
          index: this.state.index + 1
        });
        clearInterval(this._timer);
        this._setInterval();
      });
    }, timeout > 0 ? timeout : 0);
  };

  _setInterval = () => {
    this._timer = setInterval(() => {
      let index = this.state.index;
      if (index === this.state.list.length - 1) {
        clearInterval(this._timer);
      } else {
        this.setState({
          index: index + 1
        });
        this._lastAnimationTime = Number(new Date());
      }
    }, DURATION_ONE_TURN);
  };

  /**
   * 对初始数据进行排序，会在初始的前面插入一组空数据
   * @param list  显示数据
   * @param color 颜色配置，可选
   * @param isAppendData 是否是追加数据，默认 不是（false）
   * @returns {Array}   排序好的数组（用于展示）
   * @private
   */
  _sortList = (list, colorConfigList = [], isAppendData = false) => {
    let emptyObject = {
      title: '',
      MAXCOUNT: 1,
      list: null
    };
    // 先生成颜色，多少个id就生成多少个颜色
    this._makeColor(list[0].list, colorConfigList);

    // 双重排序
    // 以 id 定其在 DOM 树里的顺序；
    // 以 count 定其在 一次 显示里，图表上显示的顺序（数值大的在前——图表靠上的位置）
    const newList = list.map((oneTurn, i) => {
      // 先根据大小排序（此时是降序排列，count 从大到小）
      const arr = Object.assign([], oneTurn.list).sort((a, b) => b.count - a.count);
      // 添加属性，记录其count排位顺序
      arr.forEach((item, i) => {
        item.countIndex = i;
      });
      const MAXCOUNT = arr[0].count;   // 本次数据最大值

      // 根据id从小到大，DOM 树中的顺序，升序排序
      const arr2 = Object.assign([], oneTurn.list).sort((a, b) => a.id - b.id);
      // 遍历，将颜色添加进去
      arr2.forEach((item) => {
        item.Color = this._getColor(item.id);
      });

      const obj = {
        list: arr2,   // 数据
        MAXCOUNT: MAXCOUNT,    // 本次数据最大值
        title: oneTurn.title
      };

      // 如果是第一个，并且非追加数据，此时添加默认空数据
      if (i === 0 && !isAppendData) {
        emptyObject.list = arr2.map(item => {
          return {
            ...item,
            count: 0
          };
        });
        emptyObject.title = '数据准备中...';
      }

      return obj;
    });

    // 非追加数据情况下，前面添加值为空的过渡数据
    if (!isAppendData) {
      newList.unshift(emptyObject);
    }
    return newList;
  };

  /**
   * 获取颜色
   * @param id  数据id
   * @returns {string}  该id对应的颜色
   * @private
   */
  _getColor = (id) => {
    return this._color.get(id);
  };

  /**
   * 颜色生成，分为两种情况：
   * 1、第一种情况默认设置了颜色，则该id使用该颜色；
   * 2、第二种情况没有设置默认颜色，则使用自动生成的颜色
   * @param oneTurnList
   * @param colorConfigList
   * @private
   */
  _makeColor = (oneTurnList, colorConfigList) => {
    oneTurnList.forEach(item => {
      let color = randomColor();

      // 遍历颜色配置表
      colorConfigList.forEach(colorItem => {
        // 如果id匹配，则颜色使用提供的颜色
        if (colorItem.id === item.id) {
          color = colorItem.color;
        }
      });
      console.log(this._color.get(item.id))
      if (!this._color.get(item.id)) {
        // 将颜色添加到
        this._color.set(item.id, color);
      }
    });
  };
}

export default Container;
