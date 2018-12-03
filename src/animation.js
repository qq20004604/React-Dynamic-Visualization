/**
 * Created by 王冬 on 2018/12/03.
 * QQ: 20004604
 * weChat: qq20004604
 * ————————————————————
 * 数据结构要求：
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
 */
import React from "react";
import s from './animation.css';

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
      opacity: opacity
    };

    const width = `${(count / MAXCOUNT) * 500}px`;

    return <div className={s['row']} style={style}>
      {/* 名字 */}
      <div className={s['name']}>{name}</div>

      {/* 横条 + 数据 */}
      <div className={s["data-item"]}>
        <div className={s["item"]} style={{width: width, backgroundColor: Color}}></div>
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

  render() {
    const {list, index} = this.state;
    if (list.length === 0) {
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
  setData = (list) => {
    clearInterval(this._timer);
    this.setState({
      list: this._sortList(list),
      index: 0,
    });
  };

  // 动画（手动调用这个的时候，要求和 setData 的逻辑不能同时执行）
  action = () => {
    clearInterval(this._timer);
    this.setState({
      index: 0
    });
    setTimeout(() => {
      this.setState({
        index: 1
      });
    }, 100);
    this._timer = setInterval(() => {
      let index = this.state.index;
      if (index === this.state.list.length - 1) {
        clearInterval(this._timer);
      } else {
        this.setState({
          index: index + 1
        });
      }
    }, 2000);
  };

  // 同步动画，即赋值后立刻开始动画
  actionSync = (list) => {
    clearInterval(this._timer);
    this.setState({
      list: this._sortList(list),
      index: 0,
    }, () => {
      this.action();
    });
  };

  // 对初始数据进行排序，会在初始的前面插入一组空数据
  _sortList = (list) => {
    let emptyObject = {
      title: '',
      MAXCOUNT: 1,
      list: null
    };
    // 先生成颜色，多少个id就生成多少个颜色
    this._makeColor(list[0].list.length);


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
      arr2.forEach((item, i) => {
        item.Color = this._getColor(i);
      });

      const obj = {
        list: arr2,   // 数据
        MAXCOUNT: MAXCOUNT,    // 本次数据最大值
        title: oneTurn.title
      };
      if (i === 0) {
        emptyObject.list = arr2.map(item => {
          return {
            ...item,
            count: 0
          };
        });
      }
      return obj;
    });
    // 前面添加值为空的过渡数据
    newList.unshift(emptyObject);
    return newList;
  };

  // 获取颜色
  _getColor = (index) => {
    return this._color[index];
  };

  // 颜色生成
  _makeColor = (length) => {
    this._color = [];
    for (let i = 0; i < length; i++) {
      this._color.push(randomColor());
    }
  };
}

export default Container;
