import React from 'react';
import ReactDOM from 'react-dom';
import Animation from '../index';

// 当前是第n轮
let turn = 0;

// 生成数据
const makeData = () => {
  // 有多少组数据
  const DATACOUNT = 12;
  // 数据显示多少轮
  const TURNS = 2;

  const data = [];

  // TURNS 轮数据变换
  for (let i = turn; i < TURNS + turn; i++) {
    const oneTurn = [];
    // 每轮 DATACOUNT 组数据
    for (let j = 0; j < DATACOUNT; j++) {
      const oneTime = {
        id: `${j + 1}`,
        name: `第 ${j + 1} 号`,
        count: parseInt(Math.random() * 1000),
      };
      oneTurn.push(oneTime);
    }
    data.push({
      title: `第 ${i + 1} 月`,
      list: oneTurn
    });
  }
  turn += TURNS;

  return data;
};


class RefsDemo extends React.Component {
  render() {
    return <div>
      <Animation ref={(ani) => {
        this.ani = ani;
      }}/>
      <button onClick={this.action}>点击开始动画</button>
      <button onClick={this.addMoreData}>追加数据</button>
      <p>github地址：<a
        href="https://github.com/qq20004604/React-Dynamic-Visualization">https://github.com/qq20004604/React-Dynamic-Visualization</a>
      </p>
    </div>;
  }

  action = () => {
    const data = makeData();
    this.ani.actionSync(data, [
      {
        id: "1",
        color: "red"
      }
    ]);
  };
  addMoreData = () => {
    const data = makeData();
    this.ani.addMoreData(data);
  };
}

ReactDOM.render(
  <div>
    <RefsDemo/>
  </div>,
  document.getElementById('root')
);
